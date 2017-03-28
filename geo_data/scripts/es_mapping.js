var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
		host: 'localhost:9200',
		requestTimeout: Infinity
	});

client.indices.delete ({
	index: "db_crimes123"
}, function (err, resp, status) {
	console.log("delete", resp);
});

client.indices.create({
	index: "db_crimes123",
	body: {
		"mappings": {
			"crime": {
				"properties": {
					"crime_type": {
						"type": "text",
						"fields": {
							"keyword": {
								"type": "keyword",
								"ignore_above": 256
							}
						}
					},
					"month": {
						"type": "date",
						"format": "yyyy-MM",
						"fields": {
							"keyword": {
								"type": "keyword",
								"ignore_above": 256
							}
						}
					},
					"location": {
						"type": "text",
						"fields": {
							"keyword": {
								"type": "keyword",
								"ignore_above": 256
							}
						}
					},
					"reported_by": {
						"type": "text",
						"fields": {
							"keyword": {
								"type": "keyword",
								"ignore_above": 256
							}
						}
					},
					"lsoa_name": {
						"type": "text",
						"fields": {
							"keyword": {
								"type": "keyword",
								"ignore_above": 256
							}
						}
					},
					"last_outcome_category": {
						"type": "text",
						"fields": {
							"keyword": {
								"type": "keyword",
								"ignore_above": 256
							}
						}
					},
					"geometry": {
						"properties": {
							"coordinates": {
								"type": "geo_point"
							},
							"type": {
								"type": "text"

							}
						}
					}
				}
			}
		}
	}

}, function (err, resp, status) {
	if (err) {
		console.log(err);
	} else {
		console.log("create", resp);
	}
});
