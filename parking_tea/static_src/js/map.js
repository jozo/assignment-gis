$(document).ready(function () {
    // Map initialization
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

    map.on('click', function (e) {
        markerTarget.setLatLng(e.latlng);
        parking_layer.setGeoJSON([]);
        map.panTo(e.latlng);
        find_parking(e.latlng)
    });

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

    function find_parking(latlng) {
        toastr["info"]("Area size: " + filter_area_size + ", capacity: " + filter_min_capacity
                        + ", only free: " + filter_only_free);
        $('#loading-icon').css('visibility', 'visible');

        var data = {
            filter_area_size: filter_area_size,
            filter_min_capacity: filter_min_capacity,
            filter_only_free: filter_only_free
        };
        $.getJSON("/api/v1/parking/" + latlng.lng + "/" + latlng.lat + "/", data, function (result) {
            parking_geojson = [];
            $.each(result, function (index, value) {
                parking_geojson.push(createMarkerFrom(value, index + 1))
            });
            parking_layer.setGeoJSON(parking_geojson);
            $('#loading-icon').css('visibility', 'hidden');
        })
    }

    // Default filter
    var filter_area_size = $("#filter_area_size").val();            // metres
    var filter_min_capacity = $("#filter_min_capacity").val();      // unlimited
    var filter_only_free = $("#filter_only_free").is(':checked');

    $("#apply-filter").on('click', function (e) {
        e.preventDefault();
        filter_area_size = $("#filter_area_size").val();
        filter_min_capacity = $("#filter_min_capacity").val();
        filter_only_free = $("#filter_only_free").is(':checked');
        find_parking(markerTarget.getLatLng());
    });
});