const express = require('express');

// const router = express.Router();
const app = express();
const bodyParser = require('body-parser');

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
