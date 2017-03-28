var pg = require('pg');
var conString = "postgres://postgres:admin@localhost:5432/postgres";
var Client = require('pg').Client;

var client = new Client(conString);
client.connect();
console.time("query");
client.query("SELECT ROUND(AVG(count)) AS result FROM (SELECT to_char(month,'YYYY-MM'), COUNT(*) AS count FROM mydb.crime GROUP BY month) a", function (err, res) {
	console.timeEnd("query");
	console.log(res.rows);
	client.end();

});
