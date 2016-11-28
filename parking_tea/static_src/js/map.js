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

    function createTitleFrom(result, number) {
        var title = [];
        var fee = result.tags['fee'] ? result.tags['fee'] : 'unknown';
        if (result.name !== "") {
            title.push('<h1>' + result.name + '</h1>');
        } else {
            title.push('<h1> Parking #' + number + '</h1>');
        }
        title.push('<div class="popup-icon">');
        title.push('<i class="fa fa-eur" title="' + fee + '" aria-hidden="true"></i>');
        title.push('<i class="fa fa-map-marker" title="' + JSON.parse(result.coordinates).coordinates + '" aria-hidden="true"></i>');
        title.push('<i class="fa fa-globe" title="Area: ' + result.area + ' m2" aria-hidden="true"></i>');
        title.push('<i class="fa fa-tags" title=\'' + JSON.stringify(result.tags) + '\' aria-hidden="true"></i>');
        title.push('<i class="fa fa-plane" title="' + result.distance.toFixed(2) + ' m" aria-hidden="true"></i>');
        title.push('</div>');
        title.push('<strong>Capacity: </strong>' + (result.type == 'point' ? 0 : result.area / 15).toFixed() + ' cars<br>');
        if (result.bus_stop) {
            title.push('<h2>MHD connections</h2>');
            title.push('<div class="buses">');
            title.push('<i class="fa fa-bus" aria-hidden="true"></i>');
            title.push('<strong>' + result.bus_stop + ' <i class="fa fa-angle-double-right" aria-hidden="true"></i></strong>');
            title.push('<i class="fa fa-bus" aria-hidden="true"></i> <strong>' + result.bus_stop_start + '</strong>');
            title.push('&nbsp;&nbsp;<i class="fa fa-clock-o" aria-hidden="true"></i> ' + result.duration + ' min');
            title.push('</div>');
            title.push('<div>');
            title.push('<div></div>');
            title.push('<div><strong>Bus: </strong>' + JSON.stringify(result.transfers.toString()) + '</div>');
            title.push('</div>');
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
                'title': createTitleFrom(result, number)
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
        // noGoAreaCircle.setLatLng(latlng);
        // noGoAreaCircle.setRadius(filter_no_go_area);
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