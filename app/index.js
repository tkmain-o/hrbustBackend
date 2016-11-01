var express = require('express')

var app = express();

// templat
app.set('views', __dirname);
app.set('view engine', 'ejs');

// page
app.use(require('./site/router'));
// education information api
app.use('/api', require('./api/router'));

// app.use(require('errors/not-found'));

module.exports = app;
