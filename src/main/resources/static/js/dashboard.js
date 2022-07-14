import * as barChartData from './monthly-stat-data.js';
import {LogisticsMap} from './map/LogisticsMap.js';
import BIM from './3d-model/main.js';

/*
------------------------------------------------------------------------------------------------------------------------
swiper and hash change event
 */

const swiper = new Swiper('#swiper', {
    hashNavigation: {
        replaceState: true,
        watchState: true
    },
    pagination: {
        el: ".swiper-pagination",
        clickable: true
    }
});

function onHashChange() {
    $('.page').removeClass('page-active');
    // slice off the '#/' at the beginning of the hash
    let $page = $( document.getElementById(window.location.hash.substring(2)) );

    if ($page.length === 0) {
        $('#production-progress').addClass('page-active');
        // swiper.slideTo(0);
    } else {
        $page.addClass('page-active');
    }
}

// hashSet: triggered when swiper updates the hash
swiper.on('hashSet', onHashChange);
onHashChange();

/*
------------------------------------------------------------------------------------------------------------------------
dashboard data & global variables
 */

let productionTotal = 0;
let productionProgressCount = 0;
let productionCompletedCount = 0;
let logisticsCount = 0;
let installationCount = 0;

let productionProgressRate;
let productionCompletedRate;
let installationRate;

const apiUrlPrefix = 'http://147.8.139.123/api';

/*
------------------------------------------------------------------------------------------------------------------------
fill data
 */

$.ajax({
    url: `${apiUrlPrefix}/statTask/getTask`,
    method: 'get',
    cache: false,
    success: function (data) {
        productionTotal = data['total_module'];
        productionProgressCount = data['in_progress_module'];
        productionCompletedCount = data['completed_module'];

        productionProgressRate = productionProgressCount / productionTotal;
        productionCompletedRate = productionCompletedCount / productionTotal;
        installationRate = installationCount / productionTotal;

        $('#production-progress-percentage').text(
            Math.round(productionProgressRate * 100) + '%'
        );

        $('#production-completed-percentage').text(
            Math.round(productionCompletedRate * 100) + '%'
        );

        $('#production-progress-count').text(productionProgressCount);
        $('#production-completed-count').text(productionCompletedCount);
        $('#production-total').text(productionTotal);

        // render the diagrams
        let productionCompletedSquares = Math.round(productionCompletedRate * 100);
        let productionProgressSquares = Math.round(productionProgressRate * 100);
        let installationSquares = Math.round(installationRate * 100);

        // for (let i = 1; i <= productionCompletedSquares; ++i) {
        //     $('#pp-square-' + i).addClass('pp-square-blue');
        //     $('#pc-square-' + i).addClass('pc-square-blue');
        // }
        //
        // for (let i = productionCompletedSquares + 1;
        //      i <= productionCompletedSquares + productionProgressSquares;
        //      ++i) {
        //     $('#pp-square-' + i).addClass('pp-square-yellow');
        //     $('#pc-square-' + i).addClass('pc-square-yellow');
        // }

        for (let i = 1; i <= productionProgressSquares; ++i) {
            $('#pp-square-' + i).addClass('pp-square-yellow');
        }

        for (let i = 1; i <= productionCompletedSquares; ++i) {
            $('#pc-square-' + i).addClass('pc-square-blue');
        }

        for (let i = 1; i <= installationSquares; ++i) {
            $('#in-square-' + i).addClass('in-square-green');
        }

        for (let i = installationSquares + 1;
             i <= productionCompletedSquares;
             ++i) {
            $('#in-square-' + i).addClass('in-square-blue');
        }

        for (let i = productionCompletedSquares + 1;
             i <= productionCompletedSquares + productionProgressSquares;
             ++i) {
            $('#in-square-' + i).addClass('in-square-yellow');
        }
    },

    error: function (res) {
        console.error(res);
    }
});

/*
------------------------------------------------------------------------------------------------------------------------
production pages (in progress and completed)
 */

/*
work stage
 */

let dots = ' ';
for (let i = 0; i < 100; ++i) {
    dots += '.';
}

$.ajax({
    url: `${apiUrlPrefix}/statTask/getUnitsinProgress`,
    method: 'get',
    cache: false,
    success: function (data) {
        $('#work-stage-table > .table-body').empty();
        data.forEach(function (elem) {
            //language=HTML
            $('#work-stage-table').append(`
                <div class="table-row">
                    <div class="table-cell work-stage-name">${elem.name + dots}</div>
                    <div class="table-cell work-stage-count">${elem.count} Units</div>
                </div>
            `);
        });
    },

    error: function (res) {
        const workStages = [
            'Structure',
            'Concreting',
            'Door/window',
            'Wall',
            'Painting',
            'MEP',
            'Floor',
            'Furniture',
            'Facade',
            'Cleaning/protection',
            'T&C Final Check'
        ];

        workStages.forEach(function (elem) {
            //language=HTML
            $('#work-stage-table').append(`
                <div class="table-row">
                    <div class="table-cell work-stage-name">${elem + dots}</div>
                    <div class="table-cell work-stage-count">0 Units</div>
                </div>
            `);
        })

        console.error(res);
    }
});

/*
monthly stat (bar chart)
 */

// emulate async
setTimeout(function () {
    renderBarChart(barChartData.xAxis, barChartData.yAxis);
}, 10);

function renderBarChart(xAxisData, yAxisData) {
    for (let i = 0; i < xAxisData.length; ++i) {
        xAxisData[i] = xAxisData[i].toUpperCase();
    }

    const barChart = echarts.init(document.getElementById('bar-chart'));
    barChart.setOption({
        animation: false,
        textStyle: {
            fontFamily: 'RobotoSlab'
        },
        grid: {
            top: 40,
            left: '12%'
        },
        xAxis: {
            type: 'category',
            data: xAxisData,
            name: 'Month',
            nameLocation: 'middle',
            nameGap: 28,
            nameTextStyle: {
                fontSize: 14,
                fontStyle: 'bold'
            },
            axisLine: {
                symbol: ['none', 'arrow'],
                symbolSize: [6, 9],
                lineStyle: {
                    color: '#000'
                }
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                fontSize: 10
            },
            boundaryGap: false,
            min: function (value) {
                return value.min - 1;
            },
            max: function (value) {
                return value.max + 1;
            }
        },
        yAxis: {
            type: 'value',
            name: 'No. of Units',
            nameLocation: 'middle',
            nameGap: 6,
            nameTextStyle: {
                fontSize: 14,
                fontStyle: 'bold'
            },
            axisLine: {
                show: true,
                symbol: ['none', 'arrow'],
                symbolSize: [6, 9],
                lineStyle: {
                    color: '#000'
                }
            },
            splitLine: {
                show: false
            },
            axisLabel: {
                show: false
            },
            max: function (value) {
                return value.max + 30;
            }
        },
        series: [
            {
                type: 'bar',
                data: yAxisData,
                label: {
                    show: true,
                    position: 'top',
                    formatter: '{c}',
                    textStyle: {
                        fontStyle: 'bold'
                    }
                },
                itemStyle: {
                    color: '#80C1E9'
                }
            }
        ]
    });

    // resize when the container's width changes;
    // rerender the chart anyway when the page first loaded
    // to prevent the failure to render the chart
    new ResizeObserver(function () {
        barChart.resize();
    }).observe(document.getElementById('bar-chart'));
}

/*
------------------------------------------------------------------------------------------------------------------------
logistics page
 */

/*
global variables
 */
let logisticsMap;
let searchStatus = false; // whether the search result of a particular module is currently displayed

/*
initialize mapbox
 */
logisticsMap = new LogisticsMap('map', 7, true);
logisticsMap.requestForAllModules(resetMap);

$('#module-search-input').on('input', function () {
    // all input characters with be transformed to uppercase automatically and
    // space is disallowed in the search input field
    $(this).val($(this).val()
        .toUpperCase()
        .replace(' ', ''));
    if ($(this).val() === '') {
        clearSearch();
    }
});

$('#module-search button.search').click(function (event) {
    event.preventDefault(); // prevent page reload

    let inputValue = $('#module-search-input').val();
    if (inputValue !== '') {
        logisticsMap.requestForModuleDetail(
            {moduleid: inputValue, judgement: true},
            () => showSearchResult(),
            () => alert('No such module.\nPlease input a valid Module ID.')
        );
    }
});

function showSearchResult() {
    searchStatus = true;
    renderTraceGraph(); // render the trace graph
    logisticsMap.showLogisticsRoute(); // show route on map
}

function clearSearch() {
    hideTraceGraph();
    if (searchStatus) {
        logisticsMap.requestForAllModules(resetMap);
        searchStatus = false;
    }
}

function renderTraceGraph() {
    $('#trace-graph *').removeAttr('style'); // clear the style
    $('#trace-graph').removeClass('hide');

    let status = logisticsMap.trackedModule.status;
    let lineFillWidth;

    if (status === 0) {
        lineFillWidth = '0';
    } else if (status === 4) {
        lineFillWidth = '100%';
    } else {
        lineFillWidth = ( (2*status - 1) / 6 * 100 ) + '%';
    }

    $('#trace-graph > .line > .line-fill').css('width', lineFillWidth);

    for (let i = 0; i < status; ++i) {
        $($('#trace-graph > .node')[i]).css('background', '#FFD12D');
    }
}

function hideTraceGraph() {
    $('#trace-graph').addClass('hide');
}

function resetMap() {
    logisticsMap.clearMap();

    // show current locations of all modules in transportation
    for (let moduleId in logisticsMap.modules) {
        let color;

        switch (LogisticsMap.getStatus(logisticsMap.modules[moduleId])) {
            case 1:
                color = '#d1452d';
                break;
            case 2:
                color = '#f8c012';
                break;
            case 3:
                color = '#8fc408';
                break;
        }

        logisticsMap.addMarker(logisticsMap.modules[moduleId], moduleId, {color: color});
    }
}

/*
------------------------------------------------------------------------------------------------------------------------
installation page
 */

/*
3d model
 */

BIM.init();
BIM.animate();