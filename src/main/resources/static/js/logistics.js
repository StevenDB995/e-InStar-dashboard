$.ajax({
    url: 'http://147.8.139.123/api/icore/getlocationList',
    method: 'post',
    data: {
        moduleid: 'A-3-N-3',
        judgement: true
    },
    success: function (res) {
        console.log(res);
    },
    error: function (res) {
        console.log(res);
    }
});

(function () {
    /**
     * -----------------------------------------------------------------------------------------------------------------
     * codes to be executed immediately after all the HTML DOMs are ready
     * put global variables and actions of initializations here
     */

    /*
    global variables
     */
    var modules; // all modules in transportation
    var trackedModule; // currently tracked module returned from search result
    var markers = []; // record all current markers on map
    var searchStatus = false; // whether the search result of a particular module is currently displayed

    // mocking asynchronous ajax request
    // set delay to 10 ms
    function requestForAllModules(successHandler) {
        console.log('sent request for all modules');
        setTimeout(function () {
            modules = allModules;
            successHandler();
        }, 10);
    }

    function requestForModuleDetail(requestData, successHandler, failHandler) {
        console.log(`sent request for module ${requestData.moduleid}`);
        setTimeout(function () {
            if (allModulesDetail.hasOwnProperty(requestData.moduleid)) {
                trackedModule = allModulesDetail[requestData.moduleid].data;
                trackedModule.moduleId = requestData.moduleid;
                successHandler();
            } else {
                failHandler();
            }
        }, 100);
    }

    // reset the #panel div
    function resetPanel() {
        // show current locations of all modules in transportation
        resetMap();
        // fill statistics of the logistics in the bubbles of the #panel dom
        resetBubbles();
    }

    /*
    initialize mapbox
     */
    mapboxgl.accessToken = 'pk.eyJ1Ijoic3RldmVuZGI5OTUiLCJhIjoiY2t3YmlyeWE4MWNhdjJvcW1ibW5vd2JtcyJ9.tGHXa1ClOlu6cVe-RSiH2Q';
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v11', // style URL
        center: [114.056824, 22.543206], // starting position [lng, lat]
        zoom: 7.5 // starting zoom
    });
    map.addControl(new mapboxgl.FullscreenControl());
    map.addControl(new mapboxgl.NavigationControl({visualizePitch: true}));

    map.on('click', function (event) {
        var lngLat = event.lngLat;
        console.log(`${lngLat.lng}, ${lngLat.lat}`);

        // reverseGeocoder(lngLat, function (data) {
        //     console.log(data);
        // });
    });

    requestForAllModules(() => resetPanel());

    // convert the format of coordinates
    // from {"lng": lng, "lat": lat}
    // to [lng, lat]
    function coordinatesConverter(lngLat) {
        return [lngLat.lng, lngLat.lat];

    }

    /*
    reverse geocoding
     */
    function reverseGeocoder(lngLat, successHandler) {
        $.ajax({
            url: 'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
                lngLat.lng + ',' + lngLat.lat + '.json?access_token=' + mapboxgl.accessToken,
            type: 'get',
            success: function (data) {
                successHandler(data);
            },
            error: function () {
                console.error('Fail to retrieve geographic information');
            }
        })
    }

    /*
    register resize observer for right container
     */
    new ResizeObserver(function () {
        // resize the canvas of mapbox on change of the right container width
        map.resize();
        // only repaint the svg line when the #trace-graph dom is displayed
        if ($('#trace-graph').css('display') !== 'none') {
            setLineColor();
        }
    }).observe(document.getElementById('container-right'));

    /**
     * -----------------------------------------------------------------------------------------------------------------
     * module search
     */
    $('form#module-search button.search').click(function (event) {
        event.preventDefault(); // prevent page reload

        var inputValue = $('form#module-search input').val()
            .toUpperCase();
        if (inputValue !== '') {
            requestForModuleDetail(
                {moduleid: inputValue, judgement: true},
                () => showSearchResult(),
                () => alert('No such module.\nPlease input a valid Module ID.')
            );
        }
    });

    // hide #trace-graph dom when the search input is cleared
    $('form#module-search input').on('input', function () {
        // space is disallowed in the search input field
        $(this).val($(this).val().replace(' ', ''));
        if ($(this).val() === '') {
            clearSearch();
        }
    });

    function showSearchResult() {
        searchStatus = true;
        $('#trace-graph').show();
        renderTraceGraph(); // render the trace graph
        showLogisticsRoute(); // show route on map
        $('#panel-heading span').text(`Module ${trackedModule.moduleId}`);
        changeBubbles();
    }

    function clearSearch() {
        $('#trace-graph').hide();
        $('#panel-heading span').text('All Modules in Transportation');
        if (searchStatus) {
            requestForAllModules(() => resetPanel());
            searchStatus = false;
        } else {
            resetPanel();
        }
    }

    /**
     * -----------------------------------------------------------------------------------------------------------------
     * trace graph
     * this dom is hidden on page load, and will be displayed only if a valid module ID is searched
     */
    function renderTraceGraph() {
        // set the node image color
        for (let i = 0; i < 5; ++i) {
            let $nodeImg = $($('#trace-graph .node > img')[i]);
            if (i <= trackedModule.latest.status) {
                let imgSrc = $nodeImg.attr('src').replace('-0', '-1');
                $nodeImg.attr('src', imgSrc);
            } else {
                let imgSrc = $nodeImg.attr('src').replace('-1', '-0');
                $nodeImg.attr('src', imgSrc);
            }
        }
        // set the line color
        setLineColor();
        // remove the original estimated arrival info first
        $('.estimated-arrival').remove();
        // display estimated arrival info
        $($('#trace-graph .node')[trackedModule.latest.status]).append(
            `<div class="estimated-arrival">
                        <strong>Estimated Arrival Time:</strong>
                        <br>
                        18/9/2021
                        <br>
                        07:30
                    </div>`);
    }

    // set the line color of the #trace-graph
    function setLineColor() {
        var $svgLineLeft = $('#trace-graph svg > #line-left');
        var $svgLineRight = $('#trace-graph svg > #line-right');
        var graphWidth = $('#trace-graph').width();
        var nodeWidth = $('#trace-graph .node > img').width();
        var nodeGap = (graphWidth - nodeWidth) / 4;

        var xLeft = nodeWidth / 2;
        var xMiddle = xLeft + trackedModule.latest.status * nodeGap;
        var xRight = graphWidth - nodeWidth / 2;
        $svgLineLeft.attr('x1', xLeft + 'px')
            .attr('x2', xMiddle + 'px');
        $svgLineRight.attr('x1', xMiddle)
            .attr('x2', xRight + 'px');
    }

    /**
     * -----------------------------------------------------------------------------------------------------------------
     * mapbox
     */
    function showLogisticsRoute() {
        // remove all existing markers and route
        clearMap();

        var trail = [];
        trackedModule.trail.forEach(function (lngLat) {
            // add marker point on map
            addMarker(lngLat, trackedModule.moduleId, {color: 'red'});
            // convert the format of coordinates
            trail.push(coordinatesConverter(lngLat));
        });

        // show lines of route on map load
        map.addSource('route', {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'LineString',
                    'coordinates': trail
                }
            }
        });

        map.addLayer({
            'id': 'route',
            'type': 'line',
            'source': 'route',
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': 'red',
                'line-width': 4
            }
        });

        map.flyTo({
            center: trackedModule.trail[trackedModule.trail.length - 1],
            zoom: 10,
            speed: 0.5,
            essential: true
        });
    }

    function addMarker(lngLat, moduleId, options) {
        var divs = [];
        divs.push(
            `<div id="${moduleId}">
            <strong>Module ID:</strong> ${moduleId}
        </div>`
        );
        divs.push(
            `<div>
            ${lngLat.lng.toFixed(2)}, ${lngLat.lat.toFixed(2)}
        </div>`
        );
        var popup = new mapboxgl.Popup()
            .setHTML(divs.join(''));
        var marker = new mapboxgl.Marker(options)
            .setLngLat(lngLat)
            .setPopup(popup)
            .addTo(map);
        markers.push(marker);

        reverseGeocoder(lngLat, function (data) {
            divs.splice(1, 0, `<div>${data.features[0].place_name}</div>`)
            popup.setHTML(divs.join(''));
        });
    }

    function clearMap() {
        // remove all existing markers
        markers.forEach(function (marker) {
            marker.remove();
        });
        markers.splice(0, markers.length);
        // remove existing route
        if (map.getSource('route')) {
            map.removeLayer('route')
                .removeSource('route');
        }
    }

    function resetMap() {
        clearMap();

        // show current locations of all modules in transportation
        for (let moduleId in modules) {
            let color;
            switch (modules[moduleId].status) {
                case 0:
                case 1:
                    color = '#d1452d';
                    break;
                case 2:
                    color = '#f8c012';
                    break;
                case 3:
                case 4:
                    color = '#8fc408';
                    break;
            }
            addMarker(modules[moduleId], moduleId, {color: color});
        }
    }

    /**
     * -----------------------------------------------------------------------------------------------------------------
     * bubbles in the #panel dom
     */
    function changeBubbles() { // change the bubbles in the #panel based on module search result
        $('.bubble-container').hide();

        switch (trackedModule.latest.status) {
            case 0:
            case 1:
                $('.bubble.mainland').parent().show();
                $('.bubble.mainland .number').text(1);
                break;
            case 2:
                $('.bubble.sea').parent().show();
                $('.bubble.sea .number').text(1);
                break;
            case 3:
            case 4:
                $('.bubble.hk').parent().show();
                $('.bubble.hk .number').text(1);
                break;
        }
    }

    function resetBubbles() {
        $('.bubble-container').show();

        var mainlandCnt = 0,
            seaCnt = 0,
            hkCnt = 0;
        for (let moduleId in modules) {
            switch (modules[moduleId].status) {
                case 0:
                case 1:
                    mainlandCnt++;
                    break;
                case 2:
                    seaCnt++;
                    break;
                case 3:
                case 4:
                    hkCnt++;
                    break;
            }
        }

        $('.bubble.mainland .number').text(mainlandCnt);
        $('.bubble.sea .number').text(seaCnt);
        $('.bubble.hk .number').text(hkCnt);
    }
})();