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

var PublishingHouse = new mongoose.Schema({
    name: { type: String, required: true },
    magazines: { type: Array, required: false },
    users: { type: Array, required: false }
});

var PublishingHouseModel = mongoose.model('PublishingHouse', PublishingHouse);
module.exports.PublishingHouseModel = PublishingHouseModel;