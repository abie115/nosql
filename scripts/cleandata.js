var conn = new Mongo();
var db = conn.getDB("baza");
var crimes = db.crimes.find();


crimes.forEach(function (result) {

	var loc = {
		"type": "Point",
		"coordinates": [result.Longitude, result.Latitude]
	}
	
	var prop = {
		"date": result.Month,
		"crime_type": result.crime_type,
		"reported_by": result.reported_by,
		"Location" : result.Location,
		"lsoa_name": result.lsoa_name
	}
	
	db.crimes.update({_id: result._id},{$set : {"type":"Feature"}},false,true)
	db.crimes.update({_id: result._id},	
		{ $set: { "geometry": loc } }	
	);
	db.crimes.update({_id: result._id},	
		{ $set: { "properties": prop }} 
	);
	
	

});
