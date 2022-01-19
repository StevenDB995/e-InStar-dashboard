import {animateNumberDisplay} from './Util.js';
import BIM from './3d-model/main.js'

let animationCnt = 4;

$('#install-total .total').text(952);
animateNumberDisplay($('#install-total .installed'), 100, 1000, 0, animationComplete);

$('#install-block-a .total').text(476);
animateNumberDisplay($('#install-block-a .installed'), 60, 1000, 0, animationComplete);

$('#install-block-b .total').text(476);
animateNumberDisplay($('#install-block-b .installed'), 40, 1000, 0, animationComplete);

animateNumberDisplay($('#avg-install-time > .display-number > span'), 15, 1000, 0, animationComplete);

function animationComplete() {
    if ((--animationCnt) === 0) {
        BIM.init();
        BIM.animate();
    }
}