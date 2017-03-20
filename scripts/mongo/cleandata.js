var conn = new Mongo();
var db = conn.getDB("mojabaza");
var crimes = db.crimes.find();

crimes.forEach(function (result) {

	var loc = {
		"type": "Point",
		"coordinates": [result.Longitude, result.Latitude]
	}

	db.crimes.update({
		_id: result._id
	}, {
		$set: {
			"geometry": loc
		}
	});

});
