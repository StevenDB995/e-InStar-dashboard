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
production pages (in progress and completed)
 */

// get data
let productionTotal = 952;
let productionProgressCount = 142;
let productionCompletedCount = 285;
let factoryStorageCount = 93;

let productionProgressRate = productionProgressCount / productionTotal;
let productionCompletedRate = productionCompletedCount / productionTotal;

// fill data
$('#production-progress-percentage').text(
    productionProgressRate.toFixed(2)
    * 100 + '%'
);

$('#production-completed-percentage').text(
    productionCompletedRate.toFixed(2)
    * 100 + '%'
);

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