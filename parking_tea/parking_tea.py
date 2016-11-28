import json
from flask import Flask, render_template, request
from pgdb import connect

app = Flask(__name__)


def db_get_connection_and_cursor():
    con = connect(database='gis', host='localhost:65432', user='docker', password='docker')
    return con, con.cursor()


def db_execute(query):
    connection, cursor = db_get_connection_and_cursor()
    cursor.execute(query)
    rows = cursor.fetchall()
    cursor.close()
    connection.close()
    return rows


def build_json_from(rows, bus_stop_start=None):
    parking_places = []
    for row in rows:
        item = {'name': '' if row.name is None else row.name,
                'distance': row.distance,
                'coordinates': json.loads(row.st_asgeojson)['coordinates'],
                'area': row.area,
                'tags': row.tags}
        if bus_stop_start:
            item['bus_stop_start'] = bus_stop_start,
            item['bus_stop_end'] = row.bus_stop,
            item['duration'] = row.duration,
            item['transfers'] = row.transfers[0],
        parking_places.append(item)
    return json.dumps(parking_places, indent=4, sort_keys=True, separators=(',', ': '))


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/api/v1/parking/<float:lng>/<float:lat>/')
def parking(lng, lat):
    fee = True if request.args['filter_only_free'] == 'true' else False
    query = render_template('parking.sql.j2', latitude=lat, longitude=lng, area_size=500, capacity=0, fee=fee)
    rows = db_execute(query)
    return build_json_from(rows)


@app.route('/api/v1/park_and_ride/<float:lng>/<float:lat>/')
def park_and_ride(lng, lat):
    query = render_template('nearest_stop.sql.j2', latitude=lat, longitude=lng)
    nearest_stop = db_execute(query)[0].name

    query = render_template('park_and_ride.sql.j2', latitude=lat, longitude=lng, stop_name=nearest_stop)
    rows = db_execute(query)
    return build_json_from(rows, bus_stop_start=nearest_stop)
