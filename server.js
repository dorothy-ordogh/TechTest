// server.js file
// contains routing info

// Set up variables
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Stat = require('./models/stat');

// Connect the db
mongoose.connect('mongodb://admin:admin@ds043358.mongolab.com:43358/ldrly', function(error) {
	if (error) {
		console.log('connection error', error);
	} else {
		console.log('connection successful');
	}
});

// config app to use body-parser
// gets data in the post method 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Port we want to open communication on
var port = process.env.PORT || 3000;
// Get instance of Router
var router = express.Router();

// Middleware all requests to go through
router.use(function(req, res, next) {
	next(); 
});

/* Deals with a post request to /leaderboards.
   Invokes sendStat method that adds a stat to 
   the database */
router.route('/leaderboards')
	.post(function(req, res) {
		// Grab key value pairs from 
		// the body of the request
		var uid = req.body.uid;
		var sname = req.body.name;
		var value = req.body.value;
		// Call function: sendStat
		sendStat(uid, sname, value, req, res);
	});

/* Deals with a get request to /leaderboards/uid.
   Invokes getStats that retreives all stats for a
   user from the database */
router.route('/leaderboards/:uid(\\d+)')
	.get(function(req, res) {
		// Get parameter: uid
		var uid = req.params.uid;
		// Call function: getStats
		getStats(uid, req, res);
	});

/* Deals with a post request to /leaderboards/statname.
   Invokes getLeaderboard, which retreives all 
   instances of the stat */
router.route('/leaderboards/:stat')
	.get(function(req, res, next) {
		// Get parameter: statname
		var statname = req.params.stat;
		// Call function: getLeaderboard 
		getLeaderboard(statname, req, res);
	});

/* Params: stat name, request and response.
   Returns a JSON sorted list of all recorded users
   with entries for the specified stat arranged from
   highest to lowest. It should include the username,
   ranking, and points scored. */
var getLeaderboard = function(statName, req, res) {
	Stat.find({name: statName}, 'uid value')
		.sort({value: -1})
		.exec(function(err, stats) {
			if (err) throw err;
			// Rank stats and add attribute
			// JSON objects
			res.json(rankStats(stats));
		});
}

/* Params: stats.
   Takes a JSON array of stats and adds 
   a field called rank with the ranking */
var rankStats = function(stats) {
	var prevStat = {};
	var currentRank = 1;
	// Iterate through all stats
	for (i = 0; i < stats.length; i++) {
		stats[i] = stats[i].toJSON();
		if (prevStat["value"] === stats[i]["value"]) {
			stats[i].rank = prevStat["rank"];
		} else {
			stats[i].rank = currentRank;
			currentRank++;
		}
		prevStat = stats[i];
	}
	//return ranked stats
	return stats;
}

/* Params: user id, stat name, stat value, 
           request and response.
   Stores stats to user with specific username. */
var sendStat = function(uid, statName, statValue, req, res) {
	// Make a new stat entity
	var stat = new Stat();
		stat.name = statName;
		stat.uid = uid;
		stat.value = statValue;
		stat.created_at = Date.now();

	// Save the stat in the database
	stat.save(function(err) {
		if (err)
			res.send(err);
		res.json({ message: 'Stat added!' });
	});
}

/* Params: username, request and response.
   Returns a JSON list of all stats submitted to 
   the API for the specified user. 
   (return all stats for a user) */
function getStats(uid, req, res) {
	// Query database to get all stats with 
	Stat.find({uid: uid}, function(err, stats) {
		if (err)
			res.send(err);
		res.json(stats);
	});
}

// Top level router
app.use('/ldrly', router);

// Open port
app.listen(port);
console.log('stuff is happening on port ' + port);
