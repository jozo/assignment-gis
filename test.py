from pgdb import connect


con = connect(database='gis', host='localhost:65432', user='docker', password='docker')

cursor = con.cursor()

cursor.execute("select p.name, p.tags, st_asgeojson(p.geom) from point p where amenity='parking' limit 10")

r = cursor.fetchone()

print(r)
