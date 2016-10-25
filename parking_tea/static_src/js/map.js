$(document).ready(function () {
    // Map initialization
    L.mapbox.accessToken = 'pk.eyJ1IjoiYmxvd2Zpc2h0ZWEiLCJhIjoiY2l1NXd4ejhxMDAxbzJvczRpY283NjE0NiJ9.9Ozoh5tAqRJPZUpjUFhfYw';
    var map = L.mapbox.map('map', 'mapbox.streets').setView([48.1555, 17.1066], 15);
    // var styleLayer = L.mapbox.styleLayer('mapbox://styles/blowfishtea/ciuonni2k00kj2iqqxva0rn75').addTo(map);

    // Map settings
    // $('.leaflet-container').css('cursor', 'copy');
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

    var noGoAreaCircle = L.circle([48.1555, 17.1066], 0).addTo(map);

    map.on('contextmenu', function (e) {
        markerTarget.setLatLng(e.latlng);
        parking_layer.setGeoJSON([]);
        map.panTo(e.latlng);
        find_parking(e.latlng)
    });

    function createTitleFrom(result) {
        var title = [];
        title.push('<strong>Type: </strong>' + result.type + '<br>');
        title.push('<strong>Name: </strong>' + result.name + '<br>');
        title.push('<strong>Coordinates: </strong>' + JSON.parse(result.coordinates).coordinates + '<br>');
        title.push('<strong>Fee: </strong>' + (result.tags['fee'] ? result.tags['fee'] : '?') + '<br>');
        title.push('<strong>Area: </strong>' + result.area + ' m<sup>2</sup><br>');
        title.push('<strong>Capacity: </strong>' + (result.type == 'point' ? 0 : result.area / 15).toFixed() + '<br>');
        title.push('<strong>Tags: </strong>' + JSON.stringify(result.tags) + '<br>');
        title.push('<strong>Distance from start: </strong>' + result.distance.toFixed(2) + ' m<br>');
        if (result.bus_stop) {
            title.push('<strong>Bus stop: </strong>' + result.bus_stop);
        }
        return title.join(' ');
    }

    function createMarkerFrom(result, number) {
        return {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: JSON.parse(result.coordinates).coordinates
            },
            properties: {
                'marker-symbol': number.toString(),
                'marker-color': '#8cc63e',
                'title': createTitleFrom(result)
            }
        }
    }

    function find_parking(latlng) {
        toastr["info"]("Area size: " + filter_area_size + ", capacity: " + filter_min_capacity
            + ", only free: " + filter_only_free);
        $('#loading-icon').css('visibility', 'visible');
        noGoAreaCircle.setRadius(0);

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
    var filter_no_go_area = $("#filter_no_go_area").val();          // metres

    $("#apply-filter").on('click', function (e) {
        e.preventDefault();
        filter_area_size = $("#filter_area_size").val();
        filter_min_capacity = $("#filter_min_capacity").val();
        filter_only_free = $("#filter_only_free").is(':checked');
        find_parking(markerTarget.getLatLng());
    });

    function find_park_and_ride(latlng) {
        $('#loading-icon').css('visibility', 'visible');
        noGoAreaCircle.setLatLng(latlng);
        noGoAreaCircle.setRadius(filter_no_go_area);
        var data = {filter_no_go_area: filter_no_go_area};

        $.getJSON("/api/v1/park_and_ride/" + latlng.lng + "/" + latlng.lat + "/", data, function (result) {
            parking_geojson = [];
            $.each(result, function (index, value) {
                parking_geojson.push(createMarkerFrom(value, index + 1))
            });
            parking_layer.setGeoJSON(parking_geojson);
            $('#loading-icon').css('visibility', 'hidden');
        })
    }

    $("#park-and-ride").on('click', function (e) {
        e.preventDefault();
        filter_no_go_area = $("#filter_no_go_area").val();
        find_park_and_ride(markerTarget.getLatLng());
    });

    // Ask for current position and move to it
    navigator.geolocation.getCurrentPosition(function (location) {
        var latlng = L.latLng(location.coords.latitude, location.coords.longitude);
        markerTarget.setLatLng(latlng);
        map.panTo(latlng);
        find_parking(latlng);
    });
});