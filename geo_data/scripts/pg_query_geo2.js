var json2csv = require('json2csv');
var Client = require('pg').Client;
var conString = "postgres://postgres:admin@localhost:5432/postgres";
var fs = require('fs');
var json = {
	type: 'FeatureCollection',
	features: []
};
var loc = {
			"type": "Polygon",
			"coordinates": [[
			  [-3.0744552612304688,53.585168439492456],[-3.0744552612304688,53.62020849015501],
			  [-3.0099105834960938,53.62020849015501],[-3.0099105834960938,53.585168439492456]]]
		 };

var client = new Client(conString);
client.connect();

client.query("SELECT crime_type, reported_by, month, location, lsoa_name, ST_AsGeoJSON(geom)::json AS geometry "+
				"FROM  mydb.crime WHERE geom && "+
				"ST_MakeEnvelope(-3.0744552612304688,53.585168439492456,-3.0099105834960938,53.62020849015501)::geography "+
					"AND crime_type LIKE 'Drugs'", function (err, res) {
	client.end();
	convert(res.rows);
});

var convert = function (data) {
    var jsonData = JSON.parse(JSON.stringify(data));
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
