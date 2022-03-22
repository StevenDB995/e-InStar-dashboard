import {allModules, allModulesDetail} from '../logistics-data.js';

export class LogisticsMap {

    _map; // instance of mapboxgl.Map
    _modules; // all modules in transportation
    _trackedModule; // currently tracked module returned from search result
    _markers = []; // record all current markers on map

    constructor(containerId, zoom, control) {
        mapboxgl.accessToken = 'pk.eyJ1Ijoic3RldmVuZGI5OTUiLCJhIjoiY2t3YmlyeWE4MWNhdjJvcW1ibW5vd2JtcyJ9.tGHXa1ClOlu6cVe-RSiH2Q';
        this._map = new mapboxgl.Map({
            container: containerId, // container ID
            style: 'mapbox://styles/mapbox/streets-v11', // style URL
            center: [114.056824, 22.543206], // starting position [lng, lat]
            zoom: zoom // starting zoom
        });

        if (control) {
            this._map.addControl(new mapboxgl.FullscreenControl());
            this._map.addControl(new mapboxgl.NavigationControl({visualizePitch: true}));
        } else {
            // disable map rotation using right click + drag
            this._map.dragRotate.disable();
            // disable map rotation using touch rotation gesture
            this._map.touchZoomRotate.disableRotation();
        }

        this._map.on('click', function (event) {
            console.log(event.lngLat);
        })

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
                successHandler();
            } else {
                failHandler();
            }
        }, 100);
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

        let trail = [];
        this._trackedModule.trail.forEach((lngLat) => {
            // add marker point on map
            this.addMarker(lngLat, this._trackedModule.moduleId,
                {color: 'red', scale: markerSize},
                detailedGeoInfo);
            // convert the format of coordinates
            trail.push(LogisticsMap.coordinatesConverter(lngLat));
        });

        // check whether the style of the map is done loading
        if (this._map.isStyleLoaded()) {
            // show lines of route on map load
            this._addLines(trail, lineWidth);
        } else {
            // if the map is not done loading yet,
            // wait until it is fully loaded to add the lines
            this._map.on('load', () => {
                this._addLines(trail, lineWidth);
            });
        }

        this._map.flyTo({
            center: this._trackedModule.trail[this._trackedModule.trail.length - 1],
            zoom: 10,
            speed: flyToSpeed,
            essential: true
        });
    }

    addMarker(lngLat, moduleId, options, detailedGeoInfo = true) {
        let divs = [];
        divs.push(
            //language=HTML
            `<div>
                <strong>Box ID:</strong> ${moduleId}
            </div>
            <div>
                <strong>Truck ID:</strong> 12
            </div>
            <div>
                <strong>Status:</strong> In transportation
            </div>`
        );
        divs.push(
            //language=HTML
            `<div>
                ${lngLat.lng.toFixed(2)}, ${lngLat.lat.toFixed(2)}
            </div>`
        );

        let popup = new mapboxgl.Popup()
            .setHTML(divs.join(''));
        let marker = new mapboxgl.Marker(options)
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
                'top': [0, 0],
                'top-left': [0, 0],
                'top-right': [0, 0],
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
    static reverseGeocoder(lngLat, successHandler) {
        $.ajax({
            url: 'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
                lngLat.lng + ',' + lngLat.lat + '.json?access_token=' + mapboxgl.accessToken,
            type: 'get',
            success: (data) => {
                successHandler(data);
            },
            error: () => {
                console.error('Fail to retrieve geographic information');
            }
        });
    }

    showCurrentLogistics() {
        // remove all existing markers and route
        this.clearMap();

        // add marker point on map
        this.addMarker(this._trackedModule.latest, this._trackedModule.moduleId,
            {color: 'red'});

        this._map.flyTo({
            center: this._trackedModule.latest,
            zoom: 10,
            speed: 0.5,
            essential: true
        });
    }

}