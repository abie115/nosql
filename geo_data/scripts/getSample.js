var Transform = require('stream').Transform;
var csv = require('csv-streamify');
var JSONStream = require('JSONStream');

var csvToJSON = csv({
		objectMode: true
	});

var parser = new Transform({
		objectMode: true
	});
	
var jsonToStrings = JSONStream.stringify(false);

var firstline = false;
parser._transform = function (data, encoding, done) {
	if (firstline == false) {
		firstline = true;
	}
	else {
		if (data[4] !=="" && data[5] !== "") {
			this.push({
				crime_type: data[9],
				reported_by: data[2],
				lsoa_name: data[8],
				location: data[6],
				month: data[1],
				last_outcome_category: data[10],
				geometry: {
					type: "Point",
					coordinates: [
						parseFloat(data[4]),
						parseFloat(data[5])
					]
				}
			});
		}
	};
	done();

};

process.stdin
.pipe(process.stdout);

process.stdin.on('data', function (data) {
	console.log(data);
	//process.stdout.write(data);
});

process.stdin.on('end', function () {
	process.stdout.write('\n');
});
