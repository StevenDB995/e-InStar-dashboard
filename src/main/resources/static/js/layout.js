// expand or collapse the left container on click of the toggle button
$('#navbar-left-toggle').click(function () {
    if ($('#container-left').hasClass('collapsed')) {
        // click to expand when the left container is collapsed
        $('#container-left').removeClass('collapsed').addClass('expanded');
        $('#navbar-left-toggle i').removeClass('fa-angle-double-right').addClass('fa-angle-double-left');
        $('#container-right').css('margin-left', '280px');
    } else {
        // click to collapse when the left container is expanded
        $('#container-left').removeClass('expanded').addClass('collapsed');
        $('#navbar-left-toggle i').removeClass('fa-angle-double-left').addClass('fa-angle-double-right');
        $('#container-right').css('margin-left', '70px');
        // recover the float expand button in mobile device view after the collapse
        // remove the .expanded class anyway when the collapse button is clicked
        $('#float-expand-btn').removeClass('expanded');
    }
});

// expand left container in mobile device view
$('#float-expand-btn').click(function () {
    if ($('#container-left').hasClass('collapsed')) {
        $('#navbar-left-toggle').click();
    }
    $(this).addClass('expanded');
});