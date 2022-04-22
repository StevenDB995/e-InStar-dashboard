import {workStageData} from './work-stage-data.js';
import * as barChartData from './monthly-stat-data.js';
import {LogisticsMap} from './map/LogisticsMap.js';

/*
------------------------------------------------------------------------------------------------------------------------
swiper and hash change event
 */

const swiper = new Swiper('#swiper', {
    //enable hash navigation
    hashNavigation: {
        watchState: true
    },
    pagination: {
        el: ".swiper-pagination",
        clickable: true
    }
});

function onHashChange() {
    $('.page').removeClass('page-active');
    if ($(window.location.hash).length === 0) {
        $('#production-progress').addClass('page-active');
        swiper.slideTo(0);
    } else {
        $(window.location.hash).addClass('page-active');
    }
}

window.addEventListener('hashchange', onHashChange);
onHashChange();

/*
------------------------------------------------------------------------------------------------------------------------
get data
 */

let productionTotal = 952;
let productionProgressCount = 142;
let productionCompletedCount = 285;
let factoryStorageCount = 93;
let installationCount = 72;

let productionProgressRate = productionProgressCount / productionTotal;
let productionCompletedRate = productionCompletedCount / productionTotal;
let installationRate = installationCount / productionTotal;

/*
------------------------------------------------------------------------------------------------------------------------
header (with swiper)
 */

// fill data
$('#production-progress-percentage').text(
    productionProgressRate.toFixed(2)
    * 100 + '%'
);

$('#production-completed-percentage').text(
    productionCompletedRate.toFixed(2)
    * 100 + '%'
);

$('#installation-percentage').text(
    installationRate.toFixed(2)
    * 100 + '%'
);

/*
------------------------------------------------------------------------------------------------------------------------
production pages (in progress and completed)
 */

$('#production-progress-count').text(productionProgressCount);
$('#production-completed-count').text(productionCompletedCount);
$('#production-total').text(productionTotal);
$('#production-factory-count').text(factoryStorageCount);

// render the diagrams
let productionCompletedSquares = productionCompletedRate.toFixed(2) * 100;
let productionProgressSquares = productionProgressRate.toFixed(2) * 100;

for (let i = 1; i <= productionCompletedSquares; ++i) {
    $('#pp-square-' + i).addClass('pp-square-blue');
    $('#pc-square-' + i).addClass('pc-square-blue');
}

for (let i = productionCompletedSquares + 1;
     i <= productionCompletedSquares + productionProgressSquares;
     ++i) {
    $('#pp-square-' + i).addClass('pp-square-yellow');
    $('#pc-square-' + i).addClass('pc-square-yellow');
}

/*
work stage
 */

let dots = ' ';
for (let i = 0; i < 100; ++i) {
    dots += '.';
}

workStageData.forEach(function (elem) {
    //language=HTML
    $('#work-stage-table').append(`
        <div class="table-row">
            <div class="table-cell work-stage-name">${elem.name + dots}</div>
            <div class="table-cell work-stage-count">${elem.count} Units</div>
        </div>
    `);
});

/*
monthly stat (bar chart)
 */

for (let i = 0; i < barChartData.xAxis.length; ++i) {
    barChartData.xAxis[i] = barChartData.xAxis[i].toUpperCase();
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
        data: barChartData.xAxis,
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
            data: barChartData.yAxis,
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

window.addEventListener('hashchange', function () {
    if (window.location.hash === '#production-completed') {
        barChart.resize();
    }
});

new ResizeObserver(function () {
    barChart.resize();
}).observe(document.getElementById('bar-chart'));

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
// logisticsMap.requestForAllModules(() => resetPanel());

/*
------------------------------------------------------------------------------------------------------------------------
installation page
 */

// fill data
$('#installation-count').text(installationCount);

// render the diagram
let installationSquares = installationRate.toFixed(2) * 100;

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