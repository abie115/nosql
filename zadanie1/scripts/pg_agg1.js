var pg = require('pg');
var json2csv = require('json2csv');
var conString = "postgres://postgres:admin@localhost:5432/postgres";
var Client = require('pg').Client;
var fs = require('fs');

var client = new Client(conString);
client.connect();
console.time("query");
client.query('SELECT crime_type, COUNT(*) AS count FROM mydb.crime GROUP BY crime_type ORDER BY count DESC', function (err, res) {
	console.timeEnd("query")
	var csv = json2csv({
			data: JSON.parse(JSON.stringify(res.rows)),
			fields: ['crime_type', 'count'],
			quotes: ''
		});
	console.log(csv);
	client.end();
	if (process.argv[2]) {
		fs.writeFile(process.argv[2], csv, 'utf8', () => {});
	}
});
