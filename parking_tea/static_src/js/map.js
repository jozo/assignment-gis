$(document).ready(function () {
    // Map initialization
    L.mapbox.accessToken = 'pk.eyJ1IjoiYmxvd2Zpc2h0ZWEiLCJhIjoiY2l1NXd4ejhxMDAxbzJvczRpY283NjE0NiJ9.9Ozoh5tAqRJPZUpjUFhfYw';
    var map = L.mapbox.map('map', 'mapbox.streets').setView([48.1555, 17.1066], 15);
    // var styleLayer = L.mapbox.styleLayer('mapbox://styles/blowfishtea/ciuonni2k00kj2iqqxva0rn75').addTo(map);

    // Map settings
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

    map.on('contextmenu', function (e) {
        markerTarget.setLatLng(e.latlng);
        parking_layer.setGeoJSON([]);
        map.panTo(e.latlng);
        findParking(e.latlng)
    });

    function createTitleFrom(result, number) {
        var variables = {
            name: result.name !== "" ? result.name : 'Parking #' + number,
            fee: result.tags['fee'] ?  result.tags['fee'] : 'unknown',
            coordinates: result.coordinates,
            area: result.area,
            tags: JSON.stringify(result.tags),
            distance: result.distance.toFixed(2),
            capacity: (result.area / 15).toFixed()
        };
        if (result.bus_stop_end) {
            variables['bus_stop_end'] = result.bus_stop_end;
            variables['bus_stop_start'] = result.bus_stop_start;
            variables['duration'] = result.duration;
            variables['transfers'] = result.transfers[0];
        }
        return swig.render(markerPopupTemplate, { locals: variables});
    }

    function createMarkerFrom(result, number) {
        return {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: result.coordinates
            },
            properties: {
                'marker-symbol': number.toString(),
                'marker-color': '#8cc63e',
                'title': createTitleFrom(result, number)
            }
        }
    }

    function findParking(latlng) {
        $('#loading-icon').css('visibility', 'visible');
        var data = { filter_only_free: filter_only_free };
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
    var filter_only_free = $("#filter_only_free").is(':checked');

    function findParkAndRide(latlng) {
        $('#loading-icon').css('visibility', 'visible');
        $.getJSON("/api/v1/park_and_ride/" + latlng.lng + "/" + latlng.lat + "/", function (result) {
            parking_geojson = [];
            $.each(result, function (index, value) {
                parking_geojson.push(createMarkerFrom(value, index + 1))
            });
            parking_layer.setGeoJSON(parking_geojson);
            $('#loading-icon').css('visibility', 'hidden');
        })
    }

    $("#apply-filter").on('click', function (e) {
        e.preventDefault();
        filter_only_free = $("#filter_only_free").is(':checked');
        findParking(markerTarget.getLatLng());
    });

    $("#park-and-ride").on('click', function (e) {
        e.preventDefault();
        findParkAndRide(markerTarget.getLatLng());
    });

    // Ask for current position and move to it
    navigator.geolocation.getCurrentPosition(function (location) {
        var latlng = L.latLng(location.coords.latitude, location.coords.longitude);
        markerTarget.setLatLng(latlng);
        map.panTo(latlng);
        findParking(latlng);
    });
});