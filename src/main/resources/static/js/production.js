import {animateNumberDisplay} from './Util.js';

/**
 * ---------------------------------------------------------------------------------------------------------------------
 * block: completion rate
 */
var completedModules = 285; // to be passed via model map from backend
var totalModules = 952; // to be passed via model map from backend
var completionRate = completedModules / totalModules;

for (let i = 0; i < completionRate * 50; ++i) {
    $('#box-icon-' + i)
        .attr('src', '/images/production/box-1.png')
        .addClass('filled');
}

$('#completed-modules').text(completedModules);
$('#total-modules').text(totalModules);

animateNumberDisplay($('#completion-rate-number span'), completionRate * 100, 1000, 1);

new ResizeObserver(function () {
    if ($('#completion-rate-graph').width() < 280) {
        // shrink the box icon when the div width is less than 280px
        $('.box-icon').css({
            width: '16px',
            height: '16px'
        });
        $('.box-icon-frame').css('width', '18px');
    } else {
        $('.box-icon').removeAttr('style');
        $('.box-icon-frame').removeAttr('style');
    }

    // also adjust the font size of the number while the div width changes
    var $completionRateNumber = $('#completion-rate-number');
    if ($completionRateNumber.width() < 280) {
        $completionRateNumber.css('font-size', '88px');
    } else {
        // it's necessary to remove the style attribute to recover the original font size
        $completionRateNumber.removeAttr('style');
    }
}).observe(document.getElementById('completion-rate-graph'));

/**
 * ---------------------------------------------------------------------------------------------------------------------
 * block: monthly completion
 */
var monthlyCompletionChart = echarts.init(document.getElementById('monthly-completion'));
var option = {
    title: {
        text: 'Monthly Statistics',
        left: 'center'
    },
    grid: {
        left: '15%'
    },
    xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    yAxis: {
        type: 'value',
        name: 'No. of Modules',
        nameLocation: 'middle',
        nameGap: 50, // default 15
        nameTextStyle: {
            fontStyle: 'bold',
            fontSize: 14,
            color: '#000'
        }
    },
    legend: {
        orient: 'vertical',
        right: '10%',
        bottom: '28%',
        padding: 10,
        backgroundColor: '#fff',
        borderColor: '#999',
        borderWidth: 2,
        borderRadius: 5,
        data: ['Planned', 'Actual']
    },
    tooltip: {
        trigger: 'axis',
        textStyle: {
            align: 'left'
        }
    },
    series: [
        {
            type: 'line',
            name: 'Planned',
            data: [1000, 1050, 1130, 1200, 1350, 1500, 1550, 1550, 1550, 1550, 1550, 1550], // to be passed via model map from backend
            smooth: true,
            lineStyle: {
                color: '#199dff',
                width: 3
            },
            itemStyle: {
                color: '#199dff'
            }
        },
        {
            type: 'line',
            name: 'Actual',
            data: [820, 932, 901, 934, 1290, 1330, 1320, 1440, 1508, 1601, 1599, 1604], // to be passed via model map from backend
            smooth: true,
            lineStyle: {
                color: '#ffc350',
                width: 3
            },
            itemStyle: {
                color: '#ffc350'
            }
        }
    ]
};
monthlyCompletionChart.setOption(option);

// the variable resizeFlag is used to fix the animation loss caused by the function eChartsInstance.resize()
// the callback of ResizeObserver is called anyway when the object is first instantiated
// regardless of the size of the observed DOM
// therefore, we introduce the boolean variable resizeFlag to prevent the first call of eChartsInstance.resize()
var resizeFlag = false;
new ResizeObserver(function () {
    if ($('#monthly-completion').width() < 480) {
        // change the chart option and rerender the chart when the container width is less than 480px
        // edit chart option before resizing
        monthlyCompletionChart.setOption({
            yAxis: {
                nameLocation: 'end',
                nameGap: 20,
                nameTextStyle: {
                    fontSize: 12
                }
            }
        });
    } else {
        // recover the original chart option
        monthlyCompletionChart.setOption(option);
    }
    // resize (or rerender) the chart
    if (resizeFlag) {
        monthlyCompletionChart.resize();
    } else {
        resizeFlag = true;
    }
}).observe(document.getElementById('container-right'));

/**
 * ---------------------------------------------------------------------------------------------------------------------
 * block: pass rate
 */
var passRate = 0.9; // to be passed via model map from backend
var failRate = 1.0 - passRate;
animateNumberDisplay($('#pass-number span'), passRate * 100, 1000, 0);
animateNumberDisplay($('#fail-number span'), failRate * 100, 1000, 0);

$('.progress-bar').attr('aria-valuenow', 80).animate({
    width: '80%'
}, {
    duration: 1000
});