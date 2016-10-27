"use strict";
var express = require('express');

var simulateLogin = require('./simulateLogin.js');

var app = express();
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", ' 3.2.1')
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

app.get('/course', function(req, res1) {
  console.log(req.query.username);
  console.log(req.query.password);
  var a = simulateLogin(req.query.username, req.query.password);
  console.log(a);
});
app.listen(4001);
console.log('Listening on port 4001');
