## Aldona Biewska


Wybrany zbiór danych: [Open Crime Data in UK 11-12.16,01.17](https://data.police.uk/data/)

(zaliczenie)

- [ ] EDA
- [ ] Aggregation Pipeline

(egzamin)

- [ ] MapReduce

Informacje o komputerze na którym były wykonywane obliczenia:

| Nazwa                 | Wartosć    |
|-----------------------|------------|
| System operacyjny     | TODO |    
| Procesor              | TODO |
| Pamięć                | TODO |
| Dysk                  | TODO |
| Baza danych           | TODO |

## Przedstawienie danych
```
{
	"_id" : ObjectId("58d00a06adf75638ca295a14"),
	"crime_id" : "7931c5af83479a505e03cb661eaf0e0946da35348a352227406f91f35b6d5a72",
	"crime_type" : "Criminal damage and arson",
	"reported_by" : "Avon and Somerset Constabulary",
	"lsoa_name" : "Bath and North East Somerset 001A",
	"geometry" : {
		"type" : "Point",
		"coordinates" : [
			-2.511571,
			51.414895
		]
	},
	"location" : "On or near Orchard Close",
	"month" : "2016-11"
}
```
## Mongodb

Import danych:
```
powershell "Measure-Command{mongoimport -d baza -c crimes --type csv --file ukcrimes.csv --headerline}"
```
Czas: 54s

Liczba zaimportowanych obiektów:
```
db.crimes.count()
1472074
```
### Czyszczenie danych
Usuwam rekordy w których brak współrzędnych:
```
db.crimes.remove( { "Latitude":"" } )
db.crimes.remove( { "Longitude":"" } )
```
Pozostało:
```
db.crimes.count()
1446646
```

Zmianiam nazwy pól:
```
var rename = { 
  "Crime ID" : "crime_id",
  "Crime type" : "crime_type",
  "Reported by" : "reported_by",
  "Falls within" : "falls_within",
  "LSOA code" : "lsoa_code",
  "LSOA name" : "lsoa_name",
  "Last outcome category" : "last_outcome_category",
  "Location" : "location",
  "Month" : "month"
  
};
db.crimes.update( { }, { $rename : rename }, false, true );
```
Uruchamiam skrypt, który odpowiednio przekształca dane [cleandata.js](https://github.com/abie115/nosql/tree/master/scripts/mongo/cleandata.js)

Usuwam niepotrzebne pola:

```
  db.crimes.update({},{$unset: {falls_within:1}},{multi: true});
	db.crimes.update({},{$unset: {lsoa_code:1}},{multi: true});
	db.crimes.update({},{$unset: {last_outcome_category:1}},{multi: true});
	db.crimes.update({},{$unset: {Context:1}},{multi: true});
	db.crimes.update({},{$unset: {Latitude:1}},{multi: true});
	db.crimes.update({},{$unset: {Longitude:1}},{multi: true});
```
Dodaje geoindeks:
```
db.crimes.ensureIndex({"geometry" : "2dsphere"})
```

Zapytanie z $near. Lokalizacje przestępstw w kategorii "Burglary" w styczniu 2017, w odległosci 10000 od Londynu [0.07,51.30]
```
db.crimes.find({
		"month": "2017-01",
		"crime_type": "Burglary",
		geometry: {
			$near: {
				$geometry: {
					type: "Point",
					coordinates: [0.07, 51.30]
				},
				$maxDistance: 10000
			}
		}
	}, {
		_id: 0
	}).toArray();
```
Komenda w pliku [printjson1.js](https://github.com/abie115/nosql/tree/master/scripts/mongo/printjson1.js) i zapisuje do pliku [.json](https://github.com/abie115/nosql/tree/master/other/geom1.json.js)
```
mongo --quiet printjson1.js > geom1.json
```

Przekształcam na obiekty GeoJSON za pomocą [skryptu](https://github.com/abie115/nosql/tree/master/scripts/mongo/togeoJSON.js):
```
node togeoJSON.js geom1.json mapka1.geojson
```
[Mapa1](https://github.com/abie115/nosql/tree/master/maps/mongo/mapka1.geojson)

Zapytanie z  $geoWithin. 1000 lokalizacji przestępstw na danym obszarze czworokąta.
```
db.crimes.find({
		geometry: {
			$geoWithin: {
				$polygon: [
					[
						-6.448974609375,
						55.22589019607769
					],
					[
						-8.162841796875,
						54.44768586644478
					],
					[
						-6.3116455078125,
						54.05616356873164
					],
					[
						-5.614013671875,
						54.61343614230358
					],
					[
						-6.444854736328124,
						55.22275708802209
					]
				]
			}
		}
	}, {
		_id: 0
	}).limit(100).toArray()
```
Komenda w pliku [printjson2.js](https://github.com/abie115/nosql/tree/master/scripts/mongo/printjson2.js) i zapisuje do pliku [.json](https://github.com/abie115/nosql/tree/master/other/geom2.json.js)
```
mongo --quiet printjson2.js > geom2.json
```

Przekształcam na obiekty GeoJSON za pomocą [skryptu](https://github.com/abie115/nosql/tree/master/scripts/mongo/togeoJSON.js):
```
node togeoJSON.js geom2.json mapka2.geojson
```
[Mapa2](https://github.com/abie115/nosql/tree/master/maps/mongo/mapka2.geojson)

Zapytanie z  $geoIntersects. Lokalizacja przestępstw na przecięciu między między wybranymi 3 punktami,które tworzą proste.
```
db.crimes.find({
		geometry: {
			$geoIntersects: {
				$geometry: {
					type: "LineString",
					coordinates: [[-2.506762, 51.409116], [-2.509410, 51.405481], [-2.497371, 51.412906]]
				}
			}
		}
	}, {
		_id: 0
	}).toArray()
```
Komenda w pliku [printjson3.js](https://github.com/abie115/nosql/tree/master/scripts/mongo/printjson3.js) i zapisuje do pliku [.json](https://github.com/abie115/nosql/tree/master/other/geom3.json.js)
```
mongo --quiet printjson3.js > geom3.json
```

Przekształcam na obiekty GeoJSON za pomocą [skryptu](https://github.com/abie115/nosql/tree/master/scripts/mongo/togeoJSON.js):
```
node togeoJSON.js geom3.json mapka3.geojson
```
[Mapa3](https://github.com/abie115/nosql/tree/master/maps/mongo/mapka2.geojson)
