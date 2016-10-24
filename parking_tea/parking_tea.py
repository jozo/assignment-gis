import json
from flask import Flask, render_template, request
from pgdb import connect

app = Flask(__name__)


@app.route('/')
def hello(name=None):
    return render_template('index.html', name=name)


def build_parking_query(lat, lng, args):
    fee = True if args['filter_only_free'] == 'true' else False
    capacity = int(args['filter_min_capacity'])
    return render_template('parking.sql.j2', latitude=lat, longitude=lng, area_size=int(args['filter_area_size']),
                           fee=fee, capacity=capacity)


def build_park_and_ride_query(lat, lng, args):
    no_go = int(args['filter_no_go_area'])
    return render_template('park_and_ride.sql.j2', latitude=lat, longitude=lng, no_go_area=no_go)


@app.route('/api/v1/parking/<float:lng>/<float:lat>/')
def parking(lng, lat):
    query = build_parking_query(lat, lng, request.args)
    con = connect(database='gis', host='localhost:65432', user='docker', password='docker')
    cursor = con.cursor()
    cursor.execute(query)
    rows = cursor.fetchall()
    places = []
    for row in rows:
        places.append({
            'type': row.type,
            'name': '?' if row.name is None else row.name,
            'distance': row.st_distance,
            'coordinates': row.st_asgeojson,
            'area': row.area,
            'tags': row.tags,
        })
    return json.dumps(places)


@app.route('/api/v1/park_and_ride/<float:lng>/<float:lat>/')
def park_and_ride(lng, lat):
    query = build_park_and_ride_query(lat, lng, request.args)
    con = connect(database='gis', host='localhost:65432', user='docker', password='docker')
    cursor = con.cursor()
    cursor.execute(query)
    rows = cursor.fetchall()
    places = []
    for row in rows:
        places.append({
            'type': row.type,
            'name': '?' if row.name is None else row.name,
            'distance': row.st_distance,
            'coordinates': row.st_asgeojson,
            'area': row.area,
            'tags': row.tags,
            'bus_stop': row.bus_stop,
        })
    return json.dumps(places)
