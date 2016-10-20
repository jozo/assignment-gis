import json
from flask import Flask, render_template
from pgdb import connect


app = Flask(__name__)


SQL0 = """
select p.name, p.tags, st_asgeojson(p.geom), st_distance(ST_GeomFromText('POINT(%f %f)',4326),
p.geom::geography) from point p
where amenity='parking' order by st_distance limit 10
"""


SQL1 = """
select
  p.name,
  p.tags,
  st_asgeojson(st_setsrid(p.geom, 4326)),
  st_distance(
    ST_GeomFromText('POINT(%f %f)', 3857),
    st_transform(st_setsrid(p.geom, 4326), 3857))
from point p
where amenity='parking'
order by st_distance
limit 10
"""


SQL2 = """
select
  p.name,
  p.tags,
  st_asgeojson(p.geom),
  st_distance(
    ST_GeomFromText('POINT(%f %f)', 3857),
    st_transform(st_setsrid(p.geom, 4326), 3857))
from point p
where amenity='parking'
order by st_distance
limit 10
"""


SQL3 = """
select
  p.name,
  st_asgeojson(st_transform(p.way, 4326)),
  st_distance(
    st_transform(ST_GeomFromText('POINT(%f %f)', 4326), 3857),
    st_transform(p.way, 3857))
from planet_osm_point p
where amenity='parking'
order by st_distance
limit 10
"""


SQL4 = """
select
  p.name,
  st_asgeojson(st_transform(p.way, 4326)),
  st_distance(
    st_transform(ST_GeomFromText('POINT(%f %f)', 4326), 3857),
    st_transform(p.way, 3857))
from planet_osm_point p
where amenity='parking'
union all
select
  pol.name,
  st_asgeojson(st_transform(st_centroid(pol.way), 4326)),
  st_distance(
    st_transform(ST_GeomFromText('POINT(%f %f)', 4326), 3857),
    st_transform(st_centroid(pol.way), 3857))
from planet_osm_polygon pol
where amenity='parking'
order by st_distance
limit 10
"""


SQL5 = """
select
  p.name,
  st_asgeojson(st_transform(p.way, 4326)),
  st_distance(
    st_transform(ST_GeomFromText('POINT(%f %f)', 4326), 3857),
    st_transform(p.way, 3857))
from planet_osm_point p
where amenity='parking' and %d > st_distance(
    st_transform(ST_GeomFromText('POINT(%f %f)', 4326), 3857),
    st_transform(p.way, 3857))
union all
select
  pol.name,
  st_asgeojson(st_transform(st_centroid(pol.way), 4326)),
  st_distance(
    st_transform(ST_GeomFromText('POINT(%f %f)', 4326), 3857),
    st_transform(st_centroid(pol.way), 3857))
from planet_osm_polygon pol
where amenity='parking' and %d > st_distance(
    st_transform(ST_GeomFromText('POINT(%f %f)', 4326), 3857),
    st_transform(st_centroid(pol.way), 3857))
order by st_distance
"""


@app.route('/')
@app.route('/hello/')
@app.route('/hello/<name>')
def hello(name=None):
    return render_template('index.html', name=name)


@app.route('/api/v1/<float:lng>/<float:lat>/')
def api(lng, lat):
    return json.dumps({
        'lng': lng,
        'lat': lat,
    })


@app.route('/api/v1/parking/<float:lng>/<float:lat>/')
def parking(lng, lat):
    con = connect(database='gis', host='localhost:65432', user='docker', password='docker')
    cursor = con.cursor()
    cursor.execute(SQL5, [lng, lat, 500, lng, lat, lng, lat, 500, lng, lat])
    rows = cursor.fetchall()
    return json.dumps(rows)
