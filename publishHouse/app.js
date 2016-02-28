var express = require('express');
var bodyParser = require('body-parser');
var methodOverride  = require('method-override');
var api = require('./api');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

app.get('/api/houses', api.getAllHouse);
app.get('/api/house/:name?', api.findHouse);
app.put('/api/house/:name?', api.addInformation);

app.listen(3002);