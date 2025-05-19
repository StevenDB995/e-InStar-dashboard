import * as moduleStatusStat from './demo-data/module-status-stat-data.js';
import {workStageData} from "./demo-data/work-stage-data.js";
import * as monthlyStatData from './demo-data/monthly-stat-data.js';
import {allModules} from "./demo-data/logistics-data.js";
import {LogisticsMap} from './map/LogisticsMap.js';
import BIM from './3d-model/main.js';

const apiUrlPrefix = 'http://147.8.139.123/api';

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
    let $page = $(document.getElementById(window.location.hash.substring(2)));

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
fill data
 */

function fillDashboardData(data) {
    const productionTotal = data['totalModules'];
    const productionProgressCount = data['inProgressModules'];
    const productionCompletedCount = data['completedModules'];
    const productionFactoryCount = data['inFactoryModules'];
    const installationCount = data['installedModules'];
    const logisticsCount = Object.keys(allModules).length;

    const productionProgressRate = productionProgressCount / productionTotal;
    const productionCompletedRate = productionCompletedCount / productionTotal;
    const installationRate = installationCount / productionTotal;

    $('#production-progress-percentage').text(
        (productionProgressRate * 100).toFixed(0) + '%'
    );

    $('#production-completed-percentage').text(
        (productionCompletedRate * 100).toFixed(0) + '%'
    );

    $('#logistics-count').text(logisticsCount);

    $('#installation-percentage').text(
        (installationRate * 100).toFixed(0) + '%'
    );

    $('#production-progress-count').text(productionProgressCount);
    $('#production-completed-count').text(productionCompletedCount);
    $('#production-total').text(productionTotal);
    $('#production-factory-count').text(productionFactoryCount);
    $('#installation-count').text(installationCount);

    // render the diagrams
    let productionCompletedSquares = Math.round(productionCompletedRate * 100);
    let productionProgressSquares = Math.round(productionProgressRate * 100);
    let installationSquares = Math.round(installationRate * 100);

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
}

// $.ajax({
//     url: `${apiUrlPrefix}/statTask/getTask`,
//     method: 'get',
//     cache: false,
//     success: fillDashboardData,
//     error: function (res) {
//         console.error(res);
//     }
// });

/* demo data */
fillDashboardData(moduleStatusStat);

/*
------------------------------------------------------------------------------------------------------------------------
production progress pages
 */

/*
work stage
 */

let dots = ' ';
for (let i = 0; i < 100; ++i) {
    dots += '.';
}

function fillWorkStageData(data) {
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
}

// $.ajax({
//     url: `${apiUrlPrefix}/statTask/getUnitsinProgress`,
//     method: 'get',
//     cache: false,
//     success: fillWorkStageData,
//     error: function (res) {
//         const workStages = [
//             'Structure',
//             'Concreting',
//             'Door/window',
//             'Wall',
//             'Painting',
//             'MEP',
//             'Floor',
//             'Furniture',
//             'Facade',
//             'Cleaning/protection',
//             'T&C Final Check'
//         ];
//
//         workStages.forEach(function (elem) {
//             //language=HTML
//             $('#work-stage-table').append(`
//                 <div class="table-row">
//                     <div class="table-cell work-stage-name">${elem + dots}</div>
//                     <div class="table-cell work-stage-count">0 Units</div>
//                 </div>
//             `);
//         })
//
//         console.error(res);
//     }
// });

/* demo data */
fillWorkStageData(workStageData);

/*
------------------------------------------------------------------------------------------------------------------------
production completed pages
 */

/*
monthly stat (bar chart)
 */

function renderMonthlyStatChart(xAxisData, yAxisData) {
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

renderMonthlyStatChart(monthlyStatData.months, monthlyStatData.numUnits);

/*
------------------------------------------------------------------------------------------------------------------------
logistics page
 */

let searchStatus = false; // whether the search result of a particular module is currently displayed

/*
initialize mapbox
 */
const logisticsMap = new LogisticsMap('map', 7, true);
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
        lineFillWidth = ((2 * status - 1) / 6 * 100) + '%';
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