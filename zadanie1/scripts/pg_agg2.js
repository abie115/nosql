var pg = require('pg');
var json2csv = require('json2csv');
var conString = "postgres://postgres:admin@localhost:5432/postgres";
var Client = require('pg').Client;
var fs = require('fs');

var client = new Client(conString);
client.connect();
console.time("query");
client.query("SELECT reported_by, TO_CHAR(month, 'YYYY-MM') AS date_month, COUNT(*) AS count FROM mydb.crime WHERE month > '2015-12-31'  AND crime_type LIKE 'Drugs' AND reported_by LIKE 'Cumbria Constabulary' GROUP BY reported_by, month ORDER BY count DESC", function (err, res) {
	console.timeEnd("query")
	var csv = json2csv({
			data: JSON.parse(JSON.stringify(res.rows)),
			fields: ['reported_by','date_month', 'count'],
			quotes: ''
		});
	console.log(csv);
	client.end();
	if (process.argv[2]) {
		fs.writeFile(process.argv[2], csv, 'utf8', () => {});
	}
});
