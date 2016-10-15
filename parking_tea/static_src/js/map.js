$(document).ready(function () {
    L.mapbox.accessToken = 'pk.eyJ1IjoiYmxvd2Zpc2h0ZWEiLCJhIjoiY2l1NXd4ejhxMDAxbzJvczRpY283NjE0NiJ9.9Ozoh5tAqRJPZUpjUFhfYw';
    var map = L.mapbox.map('map', 'mapbox.streets').setView([48.1555, 17.1066], 15);

    // Map settings
    $('.leaflet-container').css('cursor','copy');
    map.zoomControl.setPosition('topright');

    var markerTarget = L.marker([48.1555, 17.1066], {
        title: 'Your target',
        icon: L.mapbox.marker.icon({
            'marker-color': '#f86767',
            'marker-size': 'large',
            'marker-symbol': 'heart'
        })
    }).addTo(map);

    map.on('click', function (e) {
        markerTarget.setLatLng(e.latlng);
        map.panTo(e.latlng);
    });

    $("#show-parking").on('click', function () {
        var center = map.getCenter();
        $.getJSON("/api/v1/" + center.lng + "/" + center.lat + "/", function (result) {
            console.log(result);
            toastr["info"]("Using default 5km area");
        })
    });
});