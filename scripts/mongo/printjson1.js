var conn = new Mongo();
var db = conn.getDB("mojabaza");

var query = db.crimes.find({
		"month": "2017-01",
		"crime_type": "Burglary",
		geometry: {
			$near: {
				$geometry: {
					type: "Point",
					coordinates: [0.07, 51.30]
				},
				$maxDistance: 10000
			}
		}
	}, {
		_id: 0
	}).toArray();

printjson(query);
