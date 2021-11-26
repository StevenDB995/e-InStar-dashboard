var modules = {
    "A-3-N-5": {
        "moduleId": "A-3-N-5",
        "status": 0,
        "coordinates": [
            [113.161265, 23.062559]
        ]
    },
    "A-3-N-4": {
        "moduleId": "A-3-N-4",
        "status": 1,
        "coordinates": [
            [113.161265, 23.062559],
            [113.163761, 23.053481],
            [113.186721, 23.052533],
            [113.245812, 23.035475],
            [113.746977, 22.811362],
            [113.896176, 22.457184]
        ],
    },
    "A-3-N-3": {
        "moduleId": "A-3-N-3",
        "status": 2,
        "coordinates": [
            [113.161265, 23.062559],
            [113.163761, 23.053481],
            [113.186721, 23.052533],
            [113.245812, 23.035475],
            [113.746977, 22.811362],
            [113.896176, 22.457184],
            [113.922496, 22.360633],
            [114.117742, 22.337009]
        ]
    },
    "A-3-N-2": {
        "moduleId": "A-3-N-2",
        "status": 3,
        "coordinates": [
            [113.161265, 23.062559],
            [113.163761, 23.053481],
            [113.186721, 23.052533],
            [113.245812, 23.035475],
            [113.746977, 22.811362],
            [113.896176, 22.457184],
            [113.922496, 22.360633],
            [114.117742, 22.337009],
            [114.140315, 22.335361],
            [114.162116, 22.299075]
        ]
    },
    "A-3-N-1": {
        "moduleId": "A-3-N-1",
        "status": 4,
        "coordinates": [
            [113.161265, 23.062559],
            [113.163761, 23.053481],
            [113.186721, 23.052533],
            [113.245812, 23.035475],
            [113.746977, 22.811362],
            [113.896176, 22.457184],
            [113.922496, 22.360633],
            [114.117742, 22.337009],
            [114.140315, 22.335361],
            [114.162116, 22.299075],
            [114.174038, 22.244645]
        ]
    }
};

var trackedModule;
var markers = []; // record all current markers on map

$(function () {
    resetBubbles();
});

/**
 * ---------------------------------------------------------------------------------------------------------------------
 * module search
 */
$('form#module-search button.search').click(function (event) {
    event.preventDefault(); // prevent page reload

    var inputValue = $('form#module-search input').val()
        .toUpperCase();
    if (inputValue === '') {
        // do nothing with an empty string
    } else if (modules[inputValue] === undefined) {
        alert('No such module.\nPlease input a valid Module ID.');
    } else {
        trackedModule = modules[inputValue];
        showSearchResult();
    }
});

// hide #trace-graph dom when the search input is cleared
$('form#module-search input').on('input', function () {
    $(this).val($(this).val().replace(' ', ''));
    if ($(this).val() === '') {
        clearSearch();
    }
});

function showSearchResult() {
    $('#trace-graph').show();
    renderTraceGraph(); // render the trace graph
    showLogisticsRoute(); // show route on map
    $('#panel-heading span').text(`Module ${trackedModule.moduleId}`);
    changeBubbles();
}

function clearSearch() {
    $('#trace-graph').hide();
    resetMap();
    $('#panel-heading span').text('All Modules in Transportation');
    resetBubbles();
}

/**
 * ---------------------------------------------------------------------------------------------------------------------
 * trace graph
 * this dom is hidden on page load, and will be displayed only if a valid module ID is searched
 */
function renderTraceGraph() {
    // set the node image color
    for (let i = 0; i < 5; ++i) {
        let $nodeImg = $($('#trace-graph .node > img')[i]);
        if (i <= trackedModule.status) {
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
    $($('#trace-graph .node')[trackedModule.status]).append(
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
    var xMiddle = xLeft + trackedModule.status * nodeGap;
    var xRight = graphWidth - nodeWidth / 2;
    $svgLineLeft.attr('x1', xLeft + 'px')
        .attr('x2', xMiddle + 'px');
    $svgLineRight.attr('x1', xMiddle)
        .attr('x2', xRight + 'px');
}

new ResizeObserver(function () {
    // only repaint the svg line when the #trace-graph dom is displayed
    if ($('#trace-graph').css('display') !== 'none') {
        setLineColor();
    }
}).observe(document.getElementById('container-right'));

/**
 * ---------------------------------------------------------------------------------------------------------------------
 * mapbox
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
    var coordinates = event.lngLat;
    console.log(`${coordinates.lng}, ${coordinates.lat}`);
});

// show current locations of all modules in transportation
resetMap();

new ResizeObserver(function () {
    // resize the canvas of mapbox on change of the right container width
    map.resize();
}).observe(document.getElementById('container-right'));

function showLogisticsRoute() {
    // remove all existing markers and route
    clearMap();

    // add marker point on map
    trackedModule.coordinates.forEach(function (location) {
        addMarker(location, trackedModule.moduleId, {color: 'red'});
    });

    // show lines of route on map load
    map.addSource('route', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': trackedModule.coordinates
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
        center: trackedModule.coordinates[trackedModule.coordinates.length - 1],
        zoom: 10,
        speed: 0.5,
        essential: true
    });
}

function addMarker(coordinates, moduleId, options) {
    var marker = new mapboxgl.Marker(options)
        .setLngLat(coordinates)
        .setPopup(
            new mapboxgl.Popup()
                .setHTML(
                    `<div>
                        <strong>Module ID:</strong> ${moduleId}
                    </div>
                    <div>
                        ${coordinates[0].toFixed(2)}, ${coordinates[1].toFixed(2)}
                    </div>`
                )
        )
        .addTo(map);
    markers.push(marker);
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
    Object.values(modules).forEach(function (module) {
        let color;
        switch (module.status) {
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
        addMarker(module.coordinates[module.coordinates.length - 1], module.moduleId, {color: color});
    });
}

/**
 * ---------------------------------------------------------------------------------------------------------------------
 * bubbles in the #panel dom
 */
// change the bubbles in the #panel based on module search result
function changeBubbles() {
    $('.bubble-container').hide();

    switch (trackedModule.status) {
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
    Object.values(modules).forEach(function (module) {
        switch (module.status) {
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
    });

    $('.bubble.mainland .number').text(mainlandCnt);
    $('.bubble.sea .number').text(seaCnt);
    $('.bubble.hk .number').text(hkCnt);
}