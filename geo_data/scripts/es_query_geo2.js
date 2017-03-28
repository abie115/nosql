var elasticsearch = require('elasticsearch');
var fs = require('fs');
var json = {
	type: 'FeatureCollection',
	features: []
};

var client = new elasticsearch.Client({
		host: 'localhost:9200'
	});

var loc = { 
		"type": "Feature",
		"properties": {},
		"geometry": {
			"type": "Polygon",
			"coordinates": [[[-2.2487640380859375,53.54275558463573],[-2.379913330078125,53.49376481611838],
							[-2.267303466796875,53.415261714992205],[-2.13409423828125,53.42671912317944],
							[-2.1258544921875,53.497032629876486],[-2.2487640380859375,53.54275558463573]
				]
			]
		}
};

client.search({
	index: 'db_crimes',
	type: 'crime',
	body: {
		"size": 1500,
		"query": {
			"bool": {
				"must": {
					"match_all": {}
				},
				"filter": {
					"geo_polygon": {
						"geometry.coordinates": {
							"points": [
								[-2.2487640380859375, 53.54275558463573],
								[-2.379913330078125, 53.49376481611838],
								[-2.267303466796875, 53.415261714992205],
								[-2.13409423828125, 53.42671912317944],
								[-2.1258544921875, 53.497032629876486],
								[-2.2487640380859375, 53.54275558463573]
							]
						}
					}
				}
			}
		}
	}
}, function (err, res) {
	convert(res.hits.hits);
});

var convert = function (data) {
	var jsonData = JSON.parse(JSON.stringify(data));
	fs.writeFile('pogladowyES2.json', JSON.stringify(jsonData, null, "\t"), 'utf8', () => {});
	for (var el of jsonData)  {
		var data = {
			type: "Feature",
			properties: {
				month: el._source.month,
				location: el._source.location,
				crime_type: el._source.crime_type,
				lsoa_name: el._source.lsoa_name,
				reported_by: el._source.reported_by
			},
			geometry: el._source.geometry
		}
		json.features.push(data)
	}
	json.features.push(loc);

	if (process.argv[2]) {
		fs.writeFile(process.argv[2], JSON.stringify(json, null, "\t"), 'utf8', () => {});
		console.log("Mapka zapisana w pliku: "+process.argv[2])}
	else{
		console.log("Podaj nazwę pliku w drugim parametrze.");
	}

}
