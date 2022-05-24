import {allModules, allModulesDetail} from '../logistics-data.js';

export class LogisticsMap {

    _map; // instance of mapboxgl.Map
    _modules; // all modules in transportation
    _trackedModule; // currently tracked module returned from search result
    _markers = []; // record all current markers on map

    /* parameters for custom markers */
    _markerRadius = 24;
    _tipAngle = 120 / 180 * Math.PI;

    constructor(containerId, zoom, control) {
        mapboxgl.accessToken = 'pk.eyJ1Ijoic3RldmVuZGI5OTUiLCJhIjoiY2t3YmlyeWE4MWNhdjJvcW1ibW5vd2JtcyJ9.tGHXa1ClOlu6cVe-RSiH2Q';
        this._map = new mapboxgl.Map({
            container: containerId, // container ID
            style: 'mapbox://styles/mapbox/streets-v11', // style URL
            center: [114.056824, 22.543206], // starting position [lng, lat]
            zoom: zoom // starting zoom
        });

        if (control) {
            // this._map.addControl(new mapboxgl.FullscreenControl());
            this._map.addControl(new mapboxgl.NavigationControl({visualizePitch: true}));
        } else {
            // disable map rotation using right click + drag
            this._map.dragRotate.disable();
            // disable map rotation using touch rotation gesture
            this._map.touchZoomRotate.disableRotation();
        }

        new ResizeObserver(() => {
            // resize the canvas of mapbox on change of the map dom
            this._map.resize();
        }).observe(document.getElementById(containerId));
    }

    get modules() {
        return this._modules;
    }

    get trackedModule() {
        return this._trackedModule;
    }

    // mocking asynchronous ajax request
    // set delay to 10 ms
    requestForAllModules(successHandler) {
        console.log('sent request for all modules');
        setTimeout(() => {
            this._modules = allModules;
            successHandler();
        }, 10);
    }

    requestForModuleDetail(requestData, successHandler, failHandler) {
        console.log(`sent request for module ${requestData.moduleid}`);

        setTimeout(() => {
            if (allModulesDetail.hasOwnProperty(requestData.moduleid)) {
                this._trackedModule = allModulesDetail[requestData.moduleid].data;
                this._trackedModule.moduleId = requestData.moduleid;
                this._trackedModule.status = LogisticsMap.getStatus( Object.values(this._trackedModule.latest)[0] );
                successHandler();
            } else {
                failHandler();
            }
        }, 100);

        // $.ajax({
        //     url: 'http://147.8.139.123/api/icore/getlocationList',
        //     method: 'post',
        //     data: requestData,
        //     success: (res) => {
        //         if (res.respCode.toUpperCase() === 'SUCCESS') {
        //             this._trackedModule = res.data;
        //             this._trackedModule.moduleId = requestData.moduleid;
        //             this._trackedModule.status = LogisticsMap.getStatus( Object.values(this._trackedModule.latest)[0] );
        //             successHandler();
        //         } else {
        //             failHandler();
        //         }
        //     },
        //     error: () => {
        //         failHandler();
        //     }
        // });
    }

    /**
     * show the logistics route of the currently tracked module
     * @param {Object} options
     * @param {number?} options.markerSize the size of the markers
     * @param {number?} options.lineWidth the line width of the route line
     * @param {boolean?} options.detailedGeoInfo whether to show detailed geographic information in the popup
     * @param {number?} options.flyToSpeed the speed for the flyTo function
     */
    showLogisticsRoute(options = {}) {
        let markerSize = options.markerSize || 1;
        let lineWidth = options.lineWidth || 4;
        let detailedGeoInfo = options.hasOwnProperty('detailedGeoInfo')
            ? options.detailedGeoInfo : true;
        let flyToSpeed = options.flyToSpeed || 0.5;

        // remove all existing markers and route
        this.clearMap();

        let trail = this._trackedModule.trail;
        let convertedTrail = [];
        trail.forEach((lngLat) => {
            // convert the format of coordinates
            convertedTrail.push(LogisticsMap.coordinatesConverter(lngLat));
        });

        // add the marker of source
        const markerElSrc = this._createMarkerElement('marker-factory.png', '#e78c10');
        this.addCustomMarker(trail[0], this._trackedModule.moduleId,
            markerElSrc, detailedGeoInfo);

        // add the marker of current location
        const markerElCurrent = this._createMarkerElement(
            (this._trackedModule.status === 2)
                ? 'marker-ferry.png'
                : 'marker-truck.png',
            '#23b3fd');
        this.addCustomMarker(trail[trail.length - 1], this._trackedModule.moduleId,
            markerElCurrent, detailedGeoInfo);

        // check whether the style of the map is done loading
        if (this._map.isStyleLoaded()) {
            // show lines of route on map load
            this._addLines(convertedTrail, lineWidth);
        } else {
            // if the map is not done loading yet,
            // wait until it is fully loaded to add the lines
            this._map.on('load', () => {
                this._addLines(convertedTrail, lineWidth);
            });
        }

        this._map.flyTo({
            center: trail[trail.length - 1],
            zoom: 10,
            speed: flyToSpeed,
            essential: true
        });
    }

    addMarker(lngLat, moduleId, options, detailedGeoInfo = true) {
        const divs = [];
        divs.push(
            //language=HTML
            `<div>
                <strong>Module ID:</strong> ${moduleId}
            </div>`
        );
        divs.push(
            //language=HTML
            `<div>
                ${lngLat.lng.toFixed(2)}, ${lngLat.lat.toFixed(2)}
            </div>`
        );

        const popup = new mapboxgl.Popup()
            .setHTML(divs.join(''));
        const marker = new mapboxgl.Marker(options)
            .setLngLat(lngLat)
            .setPopup(popup)
            .addTo(this._map);
        marker.isClicked = false;
        this._markers.push(marker);

        if (options.hasOwnProperty('scale')) {
            const markerHeight = 41 * options.scale;
            const markerRadius = 13.5 * options.scale;
            const linearOffset = markerRadius / Math.sqrt(2);

            popup.setOffset({
                'bottom': [0, -markerHeight],
                'bottom-left': [linearOffset, -(markerHeight - markerRadius + linearOffset)],
                'bottom-right': [-linearOffset, -(markerHeight - markerRadius + linearOffset)],
                'left': [markerRadius, -(markerHeight - markerRadius)],
                'right': [-markerRadius, -(markerHeight - markerRadius)]
            });
        }

        $(marker.getElement()).click(() => {
            if (marker.isClicked) return;
            marker.isClicked = true;

            LogisticsMap.reverseGeocoder(lngLat, (data) => {
                let geoInfo = detailedGeoInfo
                    ? data.features[0].place_name
                    : data.features[0].text;
                divs.splice(1, 0, `<div>${geoInfo}</div>`)
                popup.setHTML(divs.join(''));
            });
        });

        return marker;
    }

    addCustomMarker(lngLat, moduleId, el, detailedGeoInfo = true) {
        const marker = this.addMarker(lngLat, moduleId, el, detailedGeoInfo);

        const markerHeight = this._markerRadius * (1 + 1 / Math.sin(this._tipAngle / 2));
        const markerRadius = this._markerRadius;
        const linearOffset = markerRadius / Math.sqrt(2);

        marker.getPopup().setOffset({
            'bottom': [0, -markerHeight],
            'bottom-left': [linearOffset, -(markerHeight - markerRadius + linearOffset)],
            'bottom-right': [-linearOffset, -(markerHeight - markerRadius + linearOffset)],
            'left': [markerRadius, -(markerHeight - markerRadius)],
            'right': [-markerRadius, -(markerHeight - markerRadius)]
        });
    }

    _createMarkerElement(imgName, color) {
        const markerElement = document.createElement('div');
        $(markerElement).addClass('custom-marker');

        //language=HTML
        $(markerElement).html(`
            <div class="marker-body">
                <img src="../../images/logistics/markers/${imgName}"/>
            </div>
            <div class="marker-tip"></div>
            <div class="marker-shade"></div>
        `);

        $(markerElement).css({
            'top': -this._markerRadius / Math.sin(this._tipAngle / 2)
        });

        $(markerElement).find('.marker-body').css({
            'width': this._markerRadius * 2,
            'height': this._markerRadius * 2
        });

        $(markerElement).find('.marker-tip').css({
            'top': this._markerRadius * (1 + Math.sin(this._tipAngle / 2)),
            'border-left-width': this._markerRadius * Math.cos(this._tipAngle / 2),
            'border-right-width': this._markerRadius * Math.cos(this._tipAngle / 2),
            'border-top-width': this._markerRadius * Math.cos(this._tipAngle / 2) / Math.tan(this._tipAngle / 2)
        });

        let markerHeight = this._markerRadius * (1 + 1 / Math.sin(this._tipAngle / 2));
        let markerShadeWidth = 40;
        let markerShadeHeight = 20;
        $(markerElement).find('.marker-shade').css({
            'width': markerShadeWidth,
            'height': markerShadeHeight,
            'top': markerHeight - markerShadeHeight / 2
        });

        if (color !== undefined) {
            $(markerElement).find('.marker-body').css({
                'border-color': color
            });

            $(markerElement).find('.marker-tip').css({
                'border-top-color': color
            });
        }

        return markerElement;
    }

    _addLines(coordinates, lineWidth) {
        this._map.addSource('route', {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'LineString',
                    'coordinates': coordinates
                }
            }
        });

        this._map.addLayer({
            'id': 'route',
            'type': 'line',
            'source': 'route',
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                // 'line-color': '#3e93ff',
                'line-color': 'red',
                'line-width': lineWidth
            }
        });
    }

    clearMap() {
        // remove all existing markers
        this._markers.forEach((marker) => {
            marker.remove();
        });
        this._markers.splice(0, this._markers.length);
        // remove existing route
        if (this._map.getSource('route')) {
            this._map.removeLayer('route')
                .removeSource('route');
        }
    }

    // convert the format of coordinates
    // from {"lng": lng, "lat": lat}
    // to [lng, lat]
    static coordinatesConverter(lngLat) {
        return [lngLat.lng, lngLat.lat];
    }

    /*
    reverse geocoding
     */
    static reverseGeocoder(lngLat, successHandler, async = true) {
        $.ajax({
            url: 'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
                lngLat.lng + ',' + lngLat.lat + '.json?access_token=' + mapboxgl.accessToken,
            type: 'get',
            async: async,
            success: (data) => {
                successHandler(data);
            },
            error: () => {
                console.error('Fail to retrieve geographic information');
            }
        });
    }

    // get the transportation status of a unit
    // according to its current coordinates
    static getStatus(lngLat) {
        let status;
        LogisticsMap.reverseGeocoder(lngLat, (data) => {
            let features = data.features;

            if (features.length > 2) {
                let placeName = features[features.length - 1].place_name;
                if (placeName === 'China') {
                    status = 1; // mainland transportation
                } else if (placeName === 'Hong Kong') {
                    status = 3; // hk transportation
                }

            } else {
                status = 2; // sea transportation
            }
        }, false);

        return status;
    }

}