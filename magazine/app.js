var express = require('express');
var bodyParser = require('body-parser');
var methodOverride  = require('method-override');
var api = require('./api');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

app.get('/api/magazines', api.getAllMagazines);
app.get('/api/magazine/:name?', api.findMagazine);
app.put('/api/magazine/:name?', api.changeDescription);
app.delete('/api/magazine/:name?', api.deleteMagazine);
app.post('/api/magazine', api.addNewMagazine);

app.listen(3001);
