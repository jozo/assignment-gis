$(document).ready(function () {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYmxvd2Zpc2h0ZWEiLCJhIjoiY2l1NXd4ejhxMDAxbzJvczRpY283NjE0NiJ9.9Ozoh5tAqRJPZUpjUFhfYw';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v9',
        center: [17.1066, 48.1555],
        zoom: 15.14,
        hash: false
    });

    var geojson = {
        "type": "FeatureCollection",
        "features": []
    };

    map.on('load', function () {
        map.getCanvas().style.cursor = 'crosshair';
        // disable map rotation using right click + drag
        map.dragRotate.disable();
        // disable map rotation using touch rotation gesture
        map.touchZoomRotate.disableRotation();

        map.addSource('geojson', {
            "type": "geojson",
            "data": geojson
        });

        map.addLayer({
            id: 'measure-points',
            type: 'circle',
            source: 'geojson',
            paint: {
                'circle-radius': 10,
                'circle-color': '#ff0000'
            },
            filter: ['in', '$type', 'Point']
        });
    });

    map.on('click', function (e) {
        if (geojson.features.length > 0) geojson.features.pop();
        var point = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    e.lngLat.lng,
                    e.lngLat.lat
                ]
            },
            "properties": {
                "id": String(new Date().getTime())
            }
        };

        geojson.features.push(point);
        map.getSource('geojson').setData(geojson);
        toastr["info"]("Using default 5km area");
    });


    $("#show-parking").on('click', function () {
        var center = map.getCenter();
        $.getJSON("/api/v1/" + center.lng + "/" + center.lat + "/", function (result) {
            console.log(result);
        })
    });
});