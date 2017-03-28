var elasticsearch = require('elasticsearch');
var fs = require('fs');
var client = new elasticsearch.Client({
		host: 'localhost:9200'
	});

console.time("query");

client.search({
	index: 'db_crimesen',
	type: 'crime',
	body: {
		"size": 0,
		"aggs": {
			"group_by_crime": {
				"terms": {
					"size": 50,
					"field": "crime_type.keyword"
				}
			}
		}
	}
}, function (err, res) {
	console.timeEnd("query");

	if (process.argv[2]) {
		fs.writeFile(process.argv[2], csv, 'utf8', () => {});
	}
});
