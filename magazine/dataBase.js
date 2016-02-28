var mongoose    = require('mongoose');
var log         = require('./log')(module);

mongoose.connect('mongodb://localhost/dataMagazine');
var db = mongoose.connection;

db.on('error', function (err) {
    log.error('connection error:', err.message);
});
db.once('open', function callback () {
    log.info("Connected to DB!");
});

var Magazine = new mongoose.Schema({
    name: { type: String, required: true },
    pubHouseName: { type: String, required: true },
    description: { type: String, required: false },
    modified: { type: Date, default: Date.now }
});
var MagazineModel = mongoose.model('Magazine', Magazine);
module.exports.MagazineModel = MagazineModel;