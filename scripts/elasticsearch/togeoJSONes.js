var fs = require('fs');
var json = {
	type: 'FeatureCollection',
	features: []
};
var jsonData = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
for (var i = 0; i < jsonData.length; i++) {
	var counter = jsonData[i];
	var data = {
		type: "Feature",
		properties:{
			month: jsonData[i]._source.month,
			location: jsonData[i]._source.location,
			crime_type: jsonData[i]._source.crime_type,
			lsoa_name: jsonData[i]._source.lsoa_name,
			reported_by: jsonData[i]._source.reported_by
		},
		geometry: jsonData[i]._source.geometry
	}
	json.features.push(data)

}
fs.writeFile(process.argv[3], JSON.stringify(json,null,"\t"), 'utf8', () => {});
