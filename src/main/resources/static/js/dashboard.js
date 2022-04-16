function onHashChange() {
    $('.page').removeClass('page-active');
    $(window.location.hash).addClass('page-active');
}

window.addEventListener('hashchange', onHashChange);
onHashChange();

const swiper = new Swiper('#swiper', {
    //enable hash navigation
    hashNavigation: {
        watchState: true,
    },
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    }
});