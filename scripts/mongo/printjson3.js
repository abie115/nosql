var conn = new Mongo();
var db = conn.getDB("mojabaza");

var query = db.crimes.find({
		geometry: {
			$geoIntersects: {
				$geometry: {
					type: "LineString",
					coordinates: [[-2.506762, 51.409116], [-2.509410, 51.405481], [-2.497371, 51.412906]]
				}
			}
		}
	}, {
		_id: 0
	}).toArray()

	printjson(query);
