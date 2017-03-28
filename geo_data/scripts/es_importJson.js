var elasticsearch = require('elasticsearch');
var fs = require('fs');
var JSONStream = require('JSONStream');
var es = require('event-stream');

var client = new elasticsearch.Client({
		host: "localhost:9200",
		requestTimeout: Infinity
	});

var bulkBuild = function (index, type, data) {
	var bulkBody = [];
	crimes.forEach(item => {
		bulkBody.push({
			index: {
				_index: index,
				_type: type
			}
		});
		bulkBody.push(item);
	});
	client.bulk({
		body: bulkBody
	}).then(response => {
		var errorCount = 0;
		response.items.forEach(item => {
			if (item.index && item.index.error) {
				console.log(++errorCount, item.index.error);
			}
		});
		console.log("Successfully indexed " + (data.length - errorCount) + " out of " + data.length + " items");
	})
	.catch (console.err); ;
};

var crimes = [];
process.stdin
.pipe(JSONStream.parse())
.pipe(es.mapSync(function (data) {
		crimes.push(data);
	}).on('end', function () {
		bulkBuild('db_crimes123', 'crime', crimes);
	}));
