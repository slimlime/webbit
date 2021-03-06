// serverside node.js code

"use strict";
var express = require('express');
var path = require('path');
var logger = require('morgan');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./config');

var mongo = require('mongodb');
var monk = require('monk');

// connect to the database
var db = monk(config.mongodb.url_dev);

var main = require('./routes/main');
var api = require('./routes/api');

// load the state
var state = require('./state/state');
state.loadState();

// ensure availability of a 2D spatial index on the loc attribute (min/max necessary?)
db.get(config.mongodb.nodeCollection).ensureIndex(
  { loc: '2d' }, { min: config.webbit.minWorld, max: config.webbit.maxWorld }
);

var app = express();

// set some configuration stuff - not using any templating engine right now
app.set('client', path.join(__dirname, 'client'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cookieParser());

// make the db object available to any calls in /api
app.use('/api', function(req, res, next) {
  req.db = db;
  next();
});

// Serve the main page
app.use('/main', main);

// REST API for node queries
app.use('/api', api);

// serving directories
app.use(express.static('client'));

// for accessing clientisde JS libraries
app.use(express.static('node_modules/angular'));
app.use(express.static('node_modules/bootstrap/dist'));
app.use(express.static('node_modules/jquery/dist'));
app.use(express.static('node_modules/underscore'));

var server = app.listen(8080, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('The server is listening at http://%s:%s', host, port);
});
