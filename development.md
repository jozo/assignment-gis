Parking tea
===========

Import data to Postgres
-----------------------
1. Install Postgis
2. Create database and add postgis extension to it (fuzzystrmatch, postgis, postgis_tiger_geocoder, postgis_topology)
3. Import shapefile `shp2pgsql data/bratislava/bratislava_osm_point.shp public.point | psql -h localhost -p 65432 -d gis -U docker`

**Data to download:** https://mapzen.com/data/metro-extracts/metro/bratislava_slovakia/


docker run -d --name postgis -p 65432:5432 -v "$PWD/.postgres_data":/var/lib/postgresql kartoza/postgis

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