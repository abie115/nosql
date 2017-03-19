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
```var rename = { 
  "Crime ID" : "crime_id",
  "Crime type" : "crime_type",
  "Reported by" : "reported_by",
  "Falls within" : "falls_within",
  "LSOA code" : "lsoa_code",
  "LSOA name" : "lsoa_name",
  "Last outcome category" : "last_outcome_category"
  
};
db.crimes.update( { }, { $rename : rename }, false, true );
```
Uruchamiam skrypt, który odpowiednio przekształca dane cleandata.js

Usuwam niepotrzebne pola:

```
  db.crimes.update({},{$unset: {Month:1}},{multi: true});
  db.crimes.update({},{$unset: {crime_id:1}},{multi: true});
  db.crimes.update({},{$unset: {reported_by:1}},{multi: true});
  db.crimes.update({},{$unset: {falls_within:1}},{multi: true});
  db.crimes.update({},{$unset: {lsoa_code:1}},{multi: true});
  db.crimes.update({},{$unset: {lsoa_name:1}},{multi: true});
  db.crimes.update({},{$unset: {reported_by:1}},{multi: true});
  db.crimes.update({},{$unset: {last_outcome_category:1}},{multi: true});
  db.crimes.update({},{$unset: {Location:1}},{multi: true});
  db.crimes.update({},{$unset: {Context:1}},{multi: true});
  db.crimes.update({},{$unset: {crime_type:1}},{multi: true});
  db.crimes.update({},{$unset: {Latitude:1}},{multi: true});
  db.crimes.update({},{$unset: {Longitude:1}},{multi: true});	
```
Dodaje geoindeks:
```
db.crimes.ensureIndex({"geometry" : "2dsphere"})
```

Zapytanie z $near. Lokalizacje przestępstw w kategorii "Burglary" w styczniu 2017, w odległosci 10000 od Londynu [0.07,51.30]
```
db.crimes.find(
     {
     "properties.date": "2017-01",
     "properties.crime_type": "Burglary",
     "geometry": {
        "$near": {
           "$geometry": {
              "type": "Point",
              "coordinates": [
                 0.07,
                 51.3
              ]
           },
           "$maxDistance": 10000
        }
     }
   }
 )
```
Przekształcam na obiekty GeoJSON:
```
type geoqueryp1.json |  findstr /v "_id" | jq {type:\"FeatureCollection\",features:.} > geoquery1.geojson
```
[Mapa1](https://github.com/abie115/nosql/tree/master/maps/geoquery1.geojson)

Zapytanie z  $geoWithin. 1000 lokalizacji przestępstw na danym obszarze czworokąta.
```
 db.crimes.find(
    {
     "geometry": {
        "$geoWithin": {
           "$polygon": [
              [
                 -6.4489746,
                 55.22589
              ],
              [
                 -8.162842,
                 54.447685
              ],
              [
                 -6.3116455,
                 54.056164
              ],
              [
                 -5.6140137,
                 54.613438
              ],
              [
                 -6.4448547,
                 55.222755
              ]
           ]
        }
     }
  }
).limit(100)
```
Przekształcam na obiekty GeoJSON:
```
type geoqueryp2.json |  findstr /v "_id" | jq {type:\"FeatureCollection\",features:.} > geoquery2.geojson
```
[Mapa2](https://github.com/abie115/nosql/tree/master/maps/geoquery2.geojson)

Zapytanie z  $geoIntersects. Lokalizacja przestępstw na przecięciu między między wybranymi 3 punktami,które tworzą proste.
```
 db.crimes.find(
   {
     "geometry": {
        "$geoIntersects": {
           "$geometry": {
              "type": "LineString",
              "coordinates": [
                 [
                    -2.506762,
                    51.409115
                 ],
                 [
                    -2.50941,
                    51.40548
                 ],
                 [
                    -2.497371,
                    51.412907
                 ]
              ]
           }
        }
     }
  }   
)
```
Przekształcam na obiekty GeoJSON:
```
type geoqueryp3.json |  findstr /v "_id" | jq {type:\"FeatureCollection\",features:.} > geoquery3.geojson
```
[Mapa3](https://github.com/abie115/nosql/tree/master/maps/geoquery3.geojson)
