$(document).ready(function () {
    L.mapbox.accessToken = 'pk.eyJ1IjoiYmxvd2Zpc2h0ZWEiLCJhIjoiY2l1NXd4ejhxMDAxbzJvczRpY283NjE0NiJ9.9Ozoh5tAqRJPZUpjUFhfYw';
    var map = L.mapbox.map('map', 'mapbox.streets').setView([48.1555, 17.1066], 15);

    // Map settings
    $('.leaflet-container').css('cursor', 'copy');
    map.zoomControl.setPosition('topright');
    var parking_geojson = [];
    var parking_layer = L.mapbox.featureLayer().setGeoJSON(parking_geojson).addTo(map);

    var markerTarget = L.marker([48.1555, 17.1066], {
        title: 'Your target',
        icon: L.mapbox.marker.icon({
            'marker-color': '#f86767',
            'marker-size': 'large',
            'marker-symbol': 'heart'
        })
    }).addTo(map);

    function createMarkerFrom(result, number) {
        return {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: JSON.parse(result[1]).coordinates
            },
            properties: {
                'marker-symbol': number.toString()
            }
        }
    }

    map.on('click', function (e) {
        markerTarget.setLatLng(e.latlng);
        parking_layer.setGeoJSON([]);
        map.panTo(e.latlng);
        $.getJSON("/api/v1/parking/" + e.latlng.lng + "/" + e.latlng.lat + "/", function (result) {
            parking_geojson = [];
            $.each(result, function (index, value) {
                parking_geojson.push(createMarkerFrom(value, index+1))
            });
            parking_layer.setGeoJSON(parking_geojson);
            toastr["info"]("Using default 5km area");
        })
    });

    $("#show-parking").on('click', function () {
        var center = map.getCenter();
        $.getJSON("/api/v1/" + center.lng + "/" + center.lat + "/", function (result) {
            console.log(result);
            toastr["info"]("Using default 5km area");
        })
    });
});