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
			month: jsonData[i].month,
			location: jsonData[i].location,
			crime_type: jsonData[i].crime_type,
			lsoa_name: jsonData[i].lsoa_name,
			reported_by: jsonData[i].reported_by
		},
		geometry: jsonData[i].geometry
	}
	json.features.push(data)

}
fs.writeFile(process.argv[3], JSON.stringify(json,null,"\t"), 'utf8', () => {});
