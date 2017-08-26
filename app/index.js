const express = require('express');

// const router = express.Router();
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

app.use(bodyParser.urlencoded({ extended: false }));

const fileUpload = require('express-fileupload');

app.use(fileUpload());
// templat
app.set('views', __dirname);
app.set('view engine', 'ejs');

app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  res.header('X-Powered-By', ' 3.2.1');
  res.header('Content-Type', 'application/json;charset=utf-8');
  next();
});

// page
app.use(require('./site/router'));

app.use('/.well-know*', (req, res) => {
  res.sendFile(path.resolve(`.${req.originalUrl}`));
});
// education information api
app.use('/api', require('./api/router'));

// app.use(require('errors/not-found'));

module.exports = app;
