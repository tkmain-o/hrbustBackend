var express = require('express');

var router = express.Router();
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

// templat
app.set('views', __dirname);
app.set('view engine', 'ejs');

// page
app.use(require('./site/router'));
// education information api
app.use('/api', require('./api/router'));

// app.use(require('errors/not-found'));

module.exports = app;
