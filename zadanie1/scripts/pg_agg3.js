var pg = require('pg');
var json2csv = require('json2csv');
var conString = "postgres://postgres:admin@localhost:5432/postgres";
var Client = require('pg').Client;
var fs = require('fs');

var client = new Client(conString);
client.connect();
console.time("query");
client.query("SELECT last_outcome_category, COUNT(*) AS count FROM mydb.crime WHERE crime_type='Vehicle crime' AND month >='2015-06-01' AND month <='2015-12-31' "+
				"GROUP BY last_outcome_category ORDER BY count DESC LIMIT 5", function (err, res) 		{
	console.timeEnd("query")
	var csv = json2csv({
			data: JSON.parse(JSON.stringify(res.rows)),
			fields: ['last_outcome_category', 'count'],
			quotes: ''
		});
	console.log(csv);
	client.end();
	if (process.argv[2]) {
		fs.writeFile(process.argv[2], csv, 'utf8', () => {});
	}
});
