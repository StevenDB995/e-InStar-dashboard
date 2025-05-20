import * as moduleStatusStat from "./demo-data/module-status-stat-data.js";
import {allModules} from "./demo-data/logistics-data.js";

$('.home-card').click(function () {
    window.location.href = 'dashboard/#/' + $(this).attr('id');
});

function fillData(data) {
    const productionTotal = data['totalModules'];
    const productionProgressCount = data['inProgressModules'];
    const productionCompletedCount = data['completedModules'];
    const logisticsCount = Object.keys(allModules).length;
    const installationCount = data['installedModules'];

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
}

fillData(moduleStatusStat);

// $.ajax({
//     url: 'http://147.8.139.123/api/statTask/getTask',
//     method: 'get',
//     success: (data) => {
//         fillData(data);
//     }
// });
