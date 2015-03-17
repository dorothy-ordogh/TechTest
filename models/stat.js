// ldrlyapp/models/stat.js
// has stat model

var mongoose = require('mongoose');

var StatSchema = new mongoose.Schema({
	name: String,
	uid: Number,
	value: Number,
	created_at: Date
});

module.exports = mongoose.model('Stat', StatSchema);
