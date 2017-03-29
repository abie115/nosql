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
	"properties": {
		"marker-color": "#008000",
		"marker-size": "medium",
		"marker-symbol": "airport"
	},
	"geometry": {
		"type": "Point",
		"coordinates": [
			-2.849722,
			53.333611
		]
	}
};

client.search({
	index: 'db_crimes',
	type: 'crime',
	body: {
		"size": 500,
		"query": {
			"bool": {
				"must": {
					"match": {
						"crime_type": "Anti-social behaviour"
					}
				},
				"filter": {
					"geo_distance": {
						"distance": "5km",
						"geometry.coordinates": [-2.849722, 53.333611]
					}
				}
			}
		},
		  "sort": [
    {
      "_geo_distance": {
        "geometry.coordinates" : [-2.849722, 53.333611],
        "order":         "asc",
        "unit":          "km", 
        "distance_type": "plane" 
      }
    }
  ]
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