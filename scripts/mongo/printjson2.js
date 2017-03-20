var conn = new Mongo();
var db = conn.getDB("mojabaza");

var query = db.crimes.find({
		geometry: {
			$geoWithin: {
				$polygon: [
					[
						-6.448974609375,
						55.22589019607769
					],
					[
						-8.162841796875,
						54.44768586644478
					],
					[
						-6.3116455078125,
						54.05616356873164
					],
					[
						-5.614013671875,
						54.61343614230358
					],
					[
						-6.444854736328124,
						55.22275708802209
					]
				]
			}
		}
	}, {
		_id: 0
	}).limit(100).toArray()
	printjson(query);
