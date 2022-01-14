import {LogisticsMap} from "./map/LogisticsMap.js";

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

/**
 * ---------------------------------------------------------------------------------------------------------------------
 * codes to be executed immediately after all the HTML DOMs are ready
 * put global variables and actions of initializations here
 */

/*
global variables
 */
let logisticsMap;
let searchStatus = false; // whether the search result of a particular module is currently displayed

/*
initialize mapbox
 */
logisticsMap = new LogisticsMap('map', 7.5, true);
logisticsMap.requestForAllModules(() => resetPanel());

/*
register resize observer for right container
 */
new ResizeObserver(function () {
    // only repaint the svg line when the #trace-graph dom is displayed
    if ($('#trace-graph').css('display') !== 'none') {
        setLineColor();
    }
}).observe(document.getElementById('container-right'));

/**
 * ---------------------------------------------------------------------------------------------------------------------
 * module search
 */
$('form#module-search button.search').click(function (event) {
    event.preventDefault(); // prevent page reload

    let inputValue = $('form#module-search input').val()
        .toUpperCase();
    if (inputValue !== '') {
        logisticsMap.requestForModuleDetail(
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
    logisticsMap.showLogisticsRoute(); // show route on map
    $('#panel-heading span').text(`Module ${logisticsMap.getTrackedModule().moduleId}`);
    changeBubbles();
}

function clearSearch() {
    $('#trace-graph').hide();
    $('#panel-heading span').text('All Modules in Transportation');
    if (searchStatus) {
        logisticsMap.requestForAllModules(() => resetPanel());
        searchStatus = false;
    } else {
        resetPanel();
    }
}

// reset the #panel div
function resetPanel() {
    // show current locations of all modules in transportation
    resetMap();
    // fill statistics of the logistics in the bubbles of the #panel dom
    resetBubbles();
}

/**
 * ---------------------------------------------------------------------------------------------------------------------
 * trace graph
 * this dom is hidden on page load, and will be displayed only if a valid module ID is searched
 */
function renderTraceGraph() {
    let trackedModule = logisticsMap.getTrackedModule();

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
        //language=HTML
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
    let $svgLineLeft = $('#trace-graph svg > #line-left');
    let $svgLineRight = $('#trace-graph svg > #line-right');
    let graphWidth = $('#trace-graph').width();
    let nodeWidth = $('#trace-graph .node > img').width();
    let nodeGap = (graphWidth - nodeWidth) / 4;

    let xLeft = nodeWidth / 2;
    let xMiddle = xLeft + logisticsMap.getTrackedModule().latest.status * nodeGap;
    let xRight = graphWidth - nodeWidth / 2;
    $svgLineLeft.attr('x1', xLeft + 'px')
        .attr('x2', xMiddle + 'px');
    $svgLineRight.attr('x1', xMiddle)
        .attr('x2', xRight + 'px');
}

/**
 * ---------------------------------------------------------------------------------------------------------------------
 * mapbox
 */
function resetMap() {
    logisticsMap.clearMap();
    let modules = logisticsMap.getModules();

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

        logisticsMap.addMarker(modules[moduleId], moduleId, {color: color});
    }
}

/**
 * ---------------------------------------------------------------------------------------------------------------------
 * bubbles in the #panel dom
 */
function changeBubbles() { // change the bubbles in the #panel based on module search result
    $('.bubble-container').hide();

    switch (logisticsMap.getTrackedModule().latest.status) {
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

    let mainlandCnt = 0,
        seaCnt = 0,
        hkCnt = 0;
    let modules = logisticsMap.getModules();

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