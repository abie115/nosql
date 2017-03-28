var elasticsearch = require('elasticsearch');
var json2csv = require('json2csv');
var fs = require('fs');
var client = new elasticsearch.Client({
		host: 'localhost:9200'
	});

console.time("query");

client.search({
	index: 'db_crimesen',
	type: 'crime',
	body: {
		"query": {
	 "bool": {
	   "filter": [
		 {"term": {"crime_type.keyword": "Vehicle crime" }},
		 {"range": {"month": {"gte": "2015-06",  "lte": "2015-12"} }}
			]
		}
	  },
		"size": 0,
		"aggs": {
			"group_by_outcome": {
				"terms": {
					"size": 5,
					"field": "last_outcome_category.keyword"
				}
			}
		}
	}
}, function (err, res) {
	console.timeEnd("query");
	var json = res.aggregations.group_by_outcome.buckets;
	var csv = json2csv({
			data: JSON.parse(JSON.stringify(json)),
			fields: ['key', 'doc_count'],
			fieldNames: ['last_outcome_category', 'count'],
			quotes: ''
		});

	console.log(csv);
	if (process.argv[2]) {
		fs.writeFile(process.argv[2], csv, 'utf8', () => {});
	}
});
