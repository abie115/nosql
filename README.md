## Aldona Biewska

Wybrany zbiór danych: [Open Crime Data in UK 11-12.16,01.17](https://data.police.uk/data/)

[Zadania](https://abie115.github.io/nosql/)

(zaliczenie)

- [ ] EDA
- [ ] Aggregation Pipeline

(egzamin)

- [ ] MapReduce

Informacje o komputerze na którym były wykonywane obliczenia:

| Nazwa                 | Wartość    |
|-----------------------|------------|
| System operacyjny     | Windows 7 x64 |    
| Procesor              | Intel Core i5-2450M |
| Ilość rdzeni          | 4 |
| Pamięć                | 6GB |
| Dysk                  | 700 GB HDD |
| Baza danych           |            |

### Przedstawienie danych

Dane znajdują się w kilku folderach po kilkadziesiąt .csv przy pomocy skryptu [merge.bat](https://github.com/abie115/nosql/tree/master/scripts/merge.bat) scaliłam je w jeden csv.

Dane zawierają pola:

|Crime ID|Month|Reported by|Falls within|Longitude|Latitude|Location|LSOA code|LSOA name|Crime type|Last outcome category|Context|
|--------|-----|-----------|------------|---------|--------|--------|---------|---------|----------|---------------------|-------|

Pominęłam  m.in. pole 'Crime ID' jako, że część danych go nie zawiera.
Wybrane pola i przykładowy rekord:

```bash
{
	"_id" : ObjectId("58d00a06adf75638ca295a14"),
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
### **ZADANIE GEO**

### Elasticsearch
Do zaimportowania danych skorzystałam z narzędzia Logstash.

Tworzę indeks baza:

```bash
curl -XDELETE localhost:9200/mojabaza
```
Dodaję mappings z pliku [baza.mappings](https://github.com/abie115/nosql/tree/master/scripts/elasticsearch/baza.mappings)

```bash
curl -s -XPUT localhost:9200/mojabaza --data-binary @baza.mappings
```
Następnie uruchamiam [logstash.conf](https://github.com/abie115/nosql/tree/master/scripts/elasticsearch/logstash.conf) wraz z odpowiednią konfiguracją, która zmienia nazwy pól, dodaje typ, indeks oraz dostosowuje do późniejszego wyszukiwania przez współrzędne - pole geometry z współrzędnymi.

```bash
logstash -f logstash.conf
```
 Sprawdzam liczbę zaimportowanych obiektów:

```bash
 curl -XGET 'http://localhost:9200/mojabaza/_count'
 {"count":1446646,"_shards":{"total":5,"successful":5,"failed":0}}
```
Dla systemu Windows do zapytań należy użyć " zamiast '  oraz \\" zamiast ".

Jsony przed przekształceniem do geoJSON znajdują się [tu](https://github.com/abie115/nosql/tree/master/other/elasticsearch).

* Zapytanie z *geo_bounding_box*. Lokalizacja przestępstw w obszarze na podstawie punktów podanych jako współrzędne. Dodatkowo wyświetla tylko przestępstwa typu "Public Order":

```bash
curl -XGET "http://localhost:9200/mojabaza/_search" -d"
{	
	\"size\":3000,
    \"query\": {
        \"bool\": {
            \"must\": {
               \"match\": { \"crime_type\": \"Public order\" }
            },
           \"filter\" : {
                \"geo_bounding_box\" : {
                    \"geometry.coordinates\" : {
                        \"top_left\" : [-3.0899047851562496,53.564375142037896],
                        \"bottom_right\" : [ -2.801513671875,53.33374330585105]
                    }
                }
            }
        }
    }
}" | jq .hits.hits > geoe1.json
```
 
Przekształcam jsona na obiekty GeoJSON przy pomocy [skryptu](https://github.com/abie115/nosql/tree/master/scripts/elasticsearch/togeoJSONes.js):

```bash
node togeoJSONes.js geoe1.json mapka1_es.geojson
```
[Mapa1](https://github.com/abie115/nosql/tree/master/maps/elasticsearch/mapka1_es.geojson)

* Zapytanie z *geo_distance*. Lokalizacja przestępstw w odległości 0.5km od Lancaster [-2.7998800,54.0464900]:

```bash
 curl -XGET "http://localhost:9200/mojabaza/_search" -d"
{
	\"size\":3000,
     \"query\": {
        \"bool\": {
            \"must\": {
               \"match_all\": {}
            },
            \"filter\" : {
                \"geo_distance\" : {
                    \"distance\" : \"0.5km\",
                    \"geometry.coordinates\" : [-2.7998800,54.0464900]
                }
            }
        }
    }
}" | jq .hits.hits > geoe2.json
 ```
 
Przekształcam jsona na obiekty GeoJSON przy pomocy [skryptu](https://github.com/abie115/nosql/tree/master/scripts/elasticsearch/togeoJSONes.js):

```bash
node togeoJSONes.js geoe2.json mapka2_es.geojson
```

[Mapa2](https://github.com/abie115/nosql/tree/master/maps/elasticsearch/mapka2_es.geojson)

* Zapytanie z *geo_polygon*. Lokalizacja 20 przestępstw na zadanym obszarze, posortowane wg odległości od określonego punktu:

```bash
 curl -XGET "http://localhost:9200/mojabaza/_search" -d"
{
	\"size\":20,
    \"query\": {
        \"bool\" : {
            \"must\" : {
                \"match_all\": { }
            },
            \"filter\" : {
                \"geo_polygon\" : {
                    \"geometry.coordinates\" : {
                        \"points\" : [
				[-1.9116210937499998,52.546295697522886],
				[-2.17803955078125,52.37895253000267],
				[-1.77703857421875,52.449314140869696]
                        ]
                    }
                }
            }
        }
    },
  \"sort\": [
    {
      \"_geo_distance\": {
        \"geometry.coordinates\" : [-1.900634765625,52.47608904123904],
        \"order\":         \"asc\",
        \"unit\":          \"km\", 
        \"distance_type\": \"plane\" 
      }
    }
  ]
}"
| jq .hits.hits > geoe3.json
```
 
Przekształcam jsona na obiekty GeoJSON przy pomocy [skryptu](https://github.com/abie115/nosql/tree/master/scripts/elasticsearch/togeoJSONes.js):

```bash
node togeoJSONes.js geoe3.json mapka3_es.geojson
```

[Mapa3](https://github.com/abie115/nosql/tree/master/maps/elasticsearch/mapka3_es.geojson)

### Mongodb

Import danych:

```bash
powershell "Measure-Command{mongoimport -d baza -c crimes --type csv --file ukcrimes.csv --headerline}"
```
Czas: 54s

Liczba zaimportowanych obiektów:

```bash
db.crimes.count()
1472074
```

#### Czyszczenie danych

Usuwam rekordy w których brak współrzędnych:

```bash
db.crimes.remove( { "Latitude":"" } )
db.crimes.remove( { "Longitude":"" } )
```

Pozostało:

```bash
db.crimes.count()
1446646
```

Zmianiam nazwy pól:

```bash
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

```bash
	db.crimes.update({},{$unset: {falls_within:1}},{multi: true});
	db.crimes.update({},{$unset: {crime_id:1}},{multi: true});
	db.crimes.update({},{$unset: {last_outcome_category:1}},{multi: true});
	db.crimes.update({},{$unset: {Context:1}},{multi: true});
	db.crimes.update({},{$unset: {Latitude:1}},{multi: true});
	db.crimes.update({},{$unset: {Longitude:1}},{multi: true});
```

Dodaje geoindeks:

```bash
db.crimes.ensureIndex({"geometry" : "2dsphere"})
```


* Zapytanie z *$near*. Lokalizacje przestępstw w kategorii "Burglary" w styczniu 2017, w maksymalnej odległości 10000 od Londynu [0.07,51.30]:

```bash
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

Komenda w pliku [printjson1.js](https://github.com/abie115/nosql/tree/master/scripts/mongo/printjson1.js) i zapisuje do pliku [.json](https://github.com/abie115/nosql/tree/master/other/geom1.json)

```bash
mongo --quiet printjson1.js > geom1.json
```

Przekształcam na obiekty GeoJSON za pomocą [skryptu](https://github.com/abie115/nosql/tree/master/scripts/mongo/togeoJSON.js):

```bash
node togeoJSON.js geom1.json mapka1.geojson
```

[Mapa1](https://github.com/abie115/nosql/tree/master/maps/mongo/mapka1.geojson)

* Zapytanie z *$geoWithin*. 1000 lokalizacji przestępstw na danym obszarze czworokąta:

```bash
db.crimes.find({
	geometry: {
		$geoWithin: {
			$polygon: [
				[-6.448974609375, 55.22589019607769], [-8.162841796875, 54.44768586644478],
				[-6.3116455078125, 54.05616356873164], [-5.614013671875, 54.61343614230358],
				[-6.444854736328124, 55.22275708802209]
			]
		}
	}
}, {
	_id: 0
}).limit(100).toArray()
```

Komenda w pliku [printjson2.js](https://github.com/abie115/nosql/tree/master/scripts/mongo/printjson2.js) i zapisuje do pliku [.json](https://github.com/abie115/nosql/tree/master/other/geom2.json)

```bash
mongo --quiet printjson2.js > geom2.json
```

Przekształcam na obiekty GeoJSON za pomocą [skryptu](https://github.com/abie115/nosql/tree/master/scripts/mongo/togeoJSON.js):

```bash
node togeoJSON.js geom2.json mapka2.geojson
```

[Mapa2](https://github.com/abie115/nosql/tree/master/maps/mongo/mapka2.geojson)

* Zapytanie z *$geoIntersects*. Lokalizacja przestępstw, które znajdują się na przecięciu między wybranymi 3 punktami,które tworzą proste:

```{r, engine = 'bash', eval = FALSE}
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

Komenda w pliku [printjson3.js](https://github.com/abie115/nosql/tree/master/scripts/mongo/printjson3.js) i zapisuje do pliku [.json](https://github.com/abie115/nosql/tree/master/other/geom3.json)

```bash
mongo --quiet printjson3.js > geom3.json
```

Przekształcam na obiekty GeoJSON za pomocą [skryptu](https://github.com/abie115/nosql/tree/master/scripts/mongo/togeoJSON.js):

```bash
node togeoJSON.js geom3.json mapka3.geojson
```

[Mapa3](https://github.com/abie115/nosql/tree/master/maps/mongo/mapka3.geojson)


## **ZADANIE1**

### PostgreSQL

Eksportuje dane w formacie json z mongodb

```bash
mongoexport --db mojabaza --collection crimes --out crimes.json
```

Używam programu pgfutter do zaimportowania danych:

```bash
powershell "Measure-Command{pgfutter --pass admin json crimes.json}"

Seconds           : 57
Milliseconds      : 8
```

Sprawdzam ilość danych:

```sql
select count(*) from import.crimes;
  count
---------
 1446646
```

Dane zostały zaimportowane do jednej kolumny data. PostgreSQL wspiera json, dlatego łatwo można je przetworzyć na tabele.

Tworzę schemat oraz tabelę:

```sql
CREATE SCHEMA my

CREATE TABLE my.crimeuk(
	id VARCHAR PRIMARY KEY,
	crime_type VARCHAR,
	reported_by VARCHAR,
	lsoa_name VARCHAR,
	month DATE,
	geo_type VARCHAR,
	lon FLOAT,
	lat FLOAT
);
```

Importuję dane do tabeli z odpowiednimi typami. Jako id posłuzyło te automatycznie wygenerowane w mongo.

```sql
INSERT INTO my.crimeuk
SELECT data->'_id'->>'$oid' as id, 
	(data->>'crime_type')::varchar as crime_type,
	(data->>'reported_by')::varchar as reported_by, 
	(data->>'lsoa_name')::varchar as lsoa_name, 
	to_date(((data->>'month')),'YYYY-MM'),
	(data->>'location')::varchar as location, 
	(data->'geometry'->>'type')::varchar as geo_type,
	(data->'geometry'->'coordinates'->>0)::float as lon, 
	(data->'geometry'->'coordinates'->>1)::float as lat 
FROM import.crimes;
```

Przykładowy rekord:

```sql

SELECT * FROM my.crimeuk LIMIT 1;
            id            | crime_type  |  reported_by  |   lsoa_name    |   month    |        location         | geo_type |    lon    |    lat
--------------------------+-------------+---------------+----------------+------------+-------------------------+----------+-----------+-----------
 58d00a14adf75638ca2f7ce7 | Other crime | Surrey Police | Tandridge 008B | 2016-11-01 | On or near Hunters Gate | Point    | -0.127513 | 51.239654
 
```

#### Agregacja 1

5 najczęściej popełnianych przestępstw:

```sql
                                                           
SELECT crime_type, COUNT(*) AS count FROM my.crimeuk  GROUP BY crime_type ORDER BY count DESC LIMIT 5;
          crime_type          | count
------------------------------+--------
 Anti-social behaviour        | 379866
 Violence and sexual offences | 314699
 Criminal damage and arson    | 141112
 Other theft                  | 122107
 Burglary                     | 111715

 
```

Wykres na podstawie zapytania:

```r
require(ggplot2);
df = data.frame(crime=c('Anti-social behaviour', 'Violence and sexual offences','Criminal damage and arson',
			'Other theft','Burglary'),count=c(379866,314699,141112,122107,111715))
ggplot( data = df, aes( crime,count,group = 1 )) + geom_bar(stat="identity")
```
<img src="https://github.com/abie115/nosql/blob/master/other/wykres1.png" alt="wykres1" width="500px" height="323px"/>

#### Agregacja 2

Współrzędne geograficzne w których zlokalizowano najwięcej przestępstw:

```sql
SELECT lon, lat, COUNT(*) AS count FROM my.crimeuk GROUP BY lon,lat ORDER BY count DESC LIMIT 1;
    
    lon    |   lat    | count
-----------+----------+-------
 -0.002028 | 51.54187 |   601
 
```
 
 
#### Agregacja 3
 
 Liczba zgłoszonych przestępstw przez Surrey Police na przestrzeni 3 miesięcy:
 
```sql

SELECT TO_CHAR(month, 'YYYY-MM'), count(*) FROM my.crimeuk WHERE reported_by LIKE 'Surrey Police' GROUP BY month;
 
 to_char | count
---------+-------
 2016-12 |  7402
 2017-01 |  7077
 2016-11 |  7016
 
```
