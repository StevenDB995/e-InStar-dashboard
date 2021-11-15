$(function () {
    // recover the left container status when the page is ready
    // the status is stored in the session storage
    if (window.sessionStorage.getItem('left-container-status') === 'expanded') {
        $('#navbar-left-toggle').click();
    }

    // set the link corresponding to current page active
    switch (window.location.pathname) {
        case '/dashboard/production':
            $('#production-link').addClass('active');
            break;
        case '/':
            $('#logistics-link').addClass('active');
            break;
    }
});

// disable transition temporary when the page is loading
// remove the .no-transition class to recover css transition when the page is loaded
$(window).on('load', function () {
    setTimeout(function () {
        // set up a delay for the recovery of transition
        $('body').removeClass('no-transition');
    }, 1000);
});

// expand or collapse the left container on click of the toggle button
$('#navbar-left-toggle').click(function () {
    if (!$('#container-left').hasClass('expanded')) {
        // click to expand when the left container is collapsed
        $('#container-left').addClass('expanded');
        $('#navbar-left-toggle i').removeClass('fa-angle-double-right').addClass('fa-angle-double-left');
        $('#container-right').css('margin-left', '280px');
        // store the left container status in session storage
        window.sessionStorage.setItem('left-container-status', 'expanded');
    } else {
        // click to collapse when the left container is expanded
        $('#container-left').removeClass('expanded');
        $('#navbar-left-toggle i').removeClass('fa-angle-double-left').addClass('fa-angle-double-right');
        $('#container-right').css('margin-left', '70px');
        // recover the float expand button in mobile device view after the collapse
        // remove the .expanded class anyway when the collapse button is clicked
        $('#float-expand-btn').removeClass('expanded');
        // remove the left container status in session storage when it is collapsed
        window.sessionStorage.removeItem('left-container-status');
    }
});

// expand left container in mobile device view
$('#float-expand-btn').click(function () {
    if (!$('#container-left').hasClass('expanded')) {
        $('#navbar-left-toggle').click();
    }
    $(this).addClass('expanded');
});