$(document).ready(function () {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYmxvd2Zpc2h0ZWEiLCJhIjoiY2l1NXd4ejhxMDAxbzJvczRpY283NjE0NiJ9.9Ozoh5tAqRJPZUpjUFhfYw';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v9',
        center: [17.1066, 48.1555],
        zoom: 15.14,
        hash: false
    });

    $(".toggle-left-menu").on('click', function () {
        $("#menu-left").toggle();
        // $("#menu-left").animate({width: 'toggle'}, 350);
        // $("#menu-left").slideToggle(350);
    });

    $("#show-parking").on('click', function () {
        var center = map.getCenter();
        $.getJSON("/api/v1/"+center.lng+"/"+center.lat+"/", function (result) {
            console.log(result);
        })
    });
});