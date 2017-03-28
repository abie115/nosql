var json2csv = require('json2csv');
var pg = require('pg');
var conString = "postgres://postgres:admin@localhost:5432/postgres";
var fs = require('fs');
var json = {
	type: 'FeatureCollection',
	features: []
};

var loc;

var client = new Client(conString);
client.connect();
client.query("SELECT  ST_AsGeoJSON(ST_Buffer(ST_MakePoint(-2.187,53.555)::geography,700)::geometry)::json AS geometry", function (err, res) {
	
	loc=res.rows[0].geometry;
	client.end();

});

client.query("SELECT crime_type, reported_by,TO_CHAR(month, 'YYYY-MM') AS month, location, lsoa_name, ST_AsGeoJSON(geom)::json AS geometry "+
        "FROM  mydb.crime WHERE ST_DWithin(geom, ST_MakePoint(-2.187,53.555)::geography, 700)", function (err, res) {
	client.end();
	convert(res.rows);

});

var convert = function (data) {
    var jsonData = JSON.parse(JSON.stringify(data));
	fs.writeFile('pogladowyPG1.json', JSON.stringify(jsonData, null, "\t"), 'utf8', () => {});
	for (var el of jsonData)  {
		var data = {
			type: "Feature",
			properties: {
				month: el.month,
				location: el.location,
				crime_type: el.crime_type,
				lsoa_name: el.lsoa_name,
				reported_by: el.reported_by
			},
			geometry: el.geometry
		}
		json.features.push(data)
	}
	json.features.push(loc);

	if (process.argv[2]) {
		fs.writeFile(process.argv[2], JSON.stringify(json, null, "\t"), 'utf8', () => {});
		console.log("Mapka zapisana w pliku: "+ process.argv[2])}
	else{
		console.log("Podaj nazwę pliku w drugim parametrze.");
	}
}
