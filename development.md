Parking tea
===========

Import data to Postgres
-----------------------
1. Install Postgis
2. Create database and add postgis extension to it (fuzzystrmatch, postgis, postgis_tiger_geocoder, postgis_topology)
3. Import shapefile `shp2pgsql -W "latin1" data/bratislava/bratislava_osm_point.shp public.point | psql -h localhost -p 65432 -d gis -U docker`
4. Or import OSM/PBF `osm2pgsql -s -c --hstore --hstore-add-index -d gis -U docker -H localhost -P 65432 data/slovakia.osm.pbf`

**Data to download:** https://mapzen.com/data/metro-extracts/metro/bratislava_slovakia/

`docker run -d --name postgis -p 65432:5432 -v "$PWD/.postgres_data":/var/lib/postgresql kartoza/postgis`

About OpenStreetMap data
------------------------
Data in db are in EPSG 4326

Tiles in OSM are in EPSG 3857

Source: http://gis.stackexchange.com/questions/48949/epsg-3857-or-4326-for-googlemaps-openstreetmap-and-leaflet

Mapzen EPSG 4326

Mapbox EPSG:900913 or EPSG:3857

Source: https://mapzen.com/documentation/metro-extracts/file-format/#choose-a-file-format-in-metro-extracts

Use cases
---------

### Show nearest parking ###
1. User choose point on the map
2. System shows parking in the nearest area of the point
3. System notifies user about the size of the area
4. User can filter parking in the menu (he had to choose "Apply filter")

### Park and ride ###
1. User selects "Park and ride" in the menu
2. User chooses the size of the area where he can't park his car
3. User chooses "Apply"
4. System finds nearest bus stop to the selected point
5. System finds parking that are outside the "no go" area and have correct bus stop near it. Correct bus stop is one with at least one mutual bus number as the target bus stop.

TODO
----
- [x] Problem s posunutym kruhom, ktory ukazuje "no go zona"
- [x] Dizajn parkovist - zmena farby ikonky
- [x] Popup nad markerom ked sa nad neho prejde mysou - nazov, tagy, kapacita (staci pocitat cez js)
- [ ] Vlastny, krajsi podklad mapy s zvyraznenymi parkoviskami
- [x] Pri query pridat stlpec ci je to point alebo polygon
- [x] Pri park and ride pridat vyhladavanie aj bodov
- [ ] Pridat indexy
- [x] Pridat najdenie tvojej polohy

JSON content
------------
```
{
    type: point|polygon,
    name: string,
    coordinates: [float, float],
    tags: { key => word },
    distance: float
}
```