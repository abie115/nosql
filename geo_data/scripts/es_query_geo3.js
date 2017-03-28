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
			"type": "Polygon",
			"coordinates": [[[-3.20526123046875,54.55135864833319],[-3.20526123046875,54.348552775876065],
							[-2.9058837890625,54.348552775876065],[-2.9058837890625,54.55135864833319]]]
		};

client.search({
	index: 'db_crimes',
	type: 'crime',
	body: {
		"size":2000,
		"query": {
			"bool": {
				"must": {
					"match_all": { }
				},
			   "filter" : {
					"geo_bounding_box" : {
						"geometry.coordinates" : {
							"top_left" : [-3.20526123046875,54.55135864833319],
							"bottom_right" : [-2.9058837890625,54.348552775876065]
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