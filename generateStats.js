/*  The application that generated all of the enteties in the database */

var mongoose = require('mongoose');
var Stat = require('./models/stat');

mongoose.connect('mongodb://admin:admin@ds043358.mongolab.com:43358/ldrly', function(error) {
	if (error) {
		console.log('connection error', error);
	} else {
		console.log('connection successful');
	}
});

var numUsers = 100;
var stats = ['kills', 'points', 'level', 'missions_complete', 'xp', 'objects_collected', 'diamonds', 'coins', 'acres_owned', 'plants'];

for (var i = 0; i < numUsers; i++) {
	for (var j = 0; j < stats.length; j++) {
		var stat = new Stat();
		stat.name = stats[j];
		stat.uid = 1000+i;
		stat.value = Math.floor((Math.random() * 100) + 1);
		stat.created_at = Date.now();

		stat.save(function(err, doc) {
			if (err) console.log('oops');
			console.log('stat added ' + doc._id);
		});
	}
}