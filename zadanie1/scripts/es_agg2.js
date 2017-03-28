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
				"filter": [{
						"term": {
							"reported_by.keyword": "Cumbria Constabulary"
						}
					}, {
						"term": {
							"crime_type.keyword": "Drugs"
						}
					}, {
						"range": {
							"month": {
								"from": "2015-12"
							}
						}
					}
				]
			}
		},
		"size": 0,
		"aggs": {
			"group_by_reported": {
				"terms": {
					"field": "reported_by.keyword"
				},
				"aggs": {
					"group_by_month": {
						"terms": {
							"size": 50,
							"field": "month"
						}
					}
				}
			}
		}
	}
}, function (err, res) {
	console.timeEnd("query");
	var json = res.aggregations.group_by_reported.buckets[0].group_by_month.buckets;
	var csv = json2csv({
			data: JSON.parse(JSON.stringify(json)),
			fields: ['key_as_string', 'doc_count'],
			fieldNames: ['date_month', 'count'],
			quotes: ''
		});

	console.log(csv);
	if (process.argv[2]) {
		fs.writeFile(process.argv[2], csv, 'utf8', () => {});
	}
});
