var readline = require('readline');
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
 var i=0;
rl.on('line', function(line){
	i++;
	if(i<1000){
		console.log(line);
	}else{
		process.exit();
	}
})