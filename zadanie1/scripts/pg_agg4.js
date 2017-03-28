var pg = require('pg');
var json2csv = require('json2csv');
var conString = "postgres://postgres:admin@localhost:5432/postgres";
var Client = require('pg').Client;
var fs = require('fs');

var client = new Client(conString);
client.connect();
console.time("query");
client.query("SELECT a.location, to_char(a.month,'YYYY-MM') AS date_month, COUNT(*) AS count "+
				"FROM mydb.crime a WHERE EXISTS (SELECT b.location FROM "+
					"(SELECT c.location, COUNT(*) AS count FROM mydb.crime c GROUP BY c.location ORDER BY count DESC LIMIT 1) b "+
							"WHERE a.location = ''||b.location||'' ) GROUP BY a.month, a.location ORDER BY count DESC LIMIT 3", function (err, res) {
	
	
	client.end();
	console.timeEnd("query")
	var csv = json2csv({
			data: JSON.parse(JSON.stringify(res.rows)),
			fields: ['location','date_month', 'count'],
			quotes: ''
		});
	console.log(csv);
	if (process.argv[2]) {
		fs.writeFile(process.argv[2], csv, 'utf8', () => {});
	}
});
