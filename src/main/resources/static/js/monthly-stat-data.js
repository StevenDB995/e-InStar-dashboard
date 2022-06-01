const xAxis = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const yAxis = [0, 0, 0, 0, 1, 1, 0];

const defaultXAxis = [];
const defaultYAxis = [0, 0, 0, 0, 0, 0, 0];

const monthMap = {
    0: 'Jan',
    1: 'Feb',
    2: 'Mar',
    3: 'Apr',
    4: 'May',
    5: 'Jun',
    6: 'Jul',
    7: 'Aug',
    8: 'Sep',
    9: 'Oct',
    10: 'Nov',
    11: 'Dec'
};

let currentMonth = new Date().getMonth();
let startMonth = currentMonth - 6;
for (let i = startMonth; i <= currentMonth; ++i) {
    defaultXAxis.push(monthMap[(i < 0) ? (i + 12) : i]);
}

export {xAxis, yAxis, defaultXAxis, defaultYAxis};