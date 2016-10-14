$(document).ready(function () {
    $(".toggle-left-menu").on('click', function () {
        $("#menu-left").toggle();
    });

    // Tabs
    $(".c-tab-heading").click(function () {
        $(this).siblings().removeClass("c-tab-heading--active");
        $(this).addClass("c-tab-heading--active");
        var tabs = $(this).closest(".c-tabs").find(".c-tabs__tab");
        tabs.removeClass("c-tabs__tab--active");
        $(tabs[$(this).index()]).addClass("c-tabs__tab--active");
    });

    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-top-center",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "4000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
});