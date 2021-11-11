$('#navbar-left-toggle').click(function () {
    if ($('#container-left').hasClass('collapsed')) {
        $('#container-left').removeClass('collapsed').addClass('expanded');
        $('#navbar-left-toggle i').removeClass('fa-angle-double-right').addClass('fa-angle-double-left');
    } else {
        $('#container-left').removeClass('expanded').addClass('collapsed');
        $('#navbar-left-toggle i').removeClass('fa-angle-double-left').addClass('fa-angle-double-right');
    }
});