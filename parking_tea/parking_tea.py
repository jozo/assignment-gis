import json
from flask import Flask, render_template
from pgdb import connect


app = Flask(__name__)


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
    cursor.execute("select p.name, p.tags, st_asgeojson(p.geom), st_distance(ST_GeomFromText('POINT(%f %f)',4326), "
                   "p.geom::geography) from point p "
                   "where amenity='parking' order by st_distance limit 10", [lng, lat])
    rows = cursor.fetchall()
    return json.dumps(rows)
