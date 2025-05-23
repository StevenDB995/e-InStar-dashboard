// the threshold of the viewport width
// for hiding the left container when it's collapsed
const THRESHOLD_WIDTH = 768;

if (window.innerWidth < THRESHOLD_WIDTH) {
    window.sessionStorage.removeItem('left-container-status');
}

// recover the left container status when the page is ready
// the status is stored in the session storage
if (window.sessionStorage.getItem('left-container-status') === 'expanded') {
    expandLeftContainer();
}

// set the link corresponding to current page active
switch (window.location.pathname) {
    case '/dashboard':
        $('#home-link').addClass('active');
        break;
    case '/dashboard/production':
        $('#production-link').addClass('active');
        break;
    case '/dashboard/logistics':
        $('#logistics-link').addClass('active');
        break;
    case '/dashboard/installation':
        $('#installation-link').addClass('active');
        break;
}

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
        expandLeftContainer();
    } else {
        // click to collapse when the left container is expanded
        collapseLeftContainer();
    }
});

// expand left container in mobile device view
$('#float-expand-btn').click(function () {
    expandLeftContainer();
});

// click anywhere except left container to collapse the left container in mobile view
$('html').click(function (event) {
    if (window.innerWidth < THRESHOLD_WIDTH
        && !document.getElementById('float-expand-btn').contains(event.target)
        && $('#container-left').hasClass('expanded')
        && document.getElementById('container-right').contains(event.target)) {
        event.preventDefault();
        collapseLeftContainer();
    }
});

function expandLeftContainer() {
    $('#container-left').addClass('expanded');
    $('#container-right').addClass('shrunk');
    // store the left container status in session storage
    window.sessionStorage.setItem('left-container-status', 'expanded');
    // add the .hidden class anyway when the expand button is clicked
    $('#float-expand-btn').addClass('hidden');
}

function collapseLeftContainer() {
    $('#container-left').removeClass('expanded');
    $('#container-right').removeClass('shrunk');
    // remove the left container status in session storage when it is collapsed
    window.sessionStorage.removeItem('left-container-status');
    // recover the float expand button in mobile device view after the collapse
    // remove the .hidden class anyway when the collapse button is clicked
    $('#float-expand-btn').removeClass('hidden');
}