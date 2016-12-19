// var course = require('./edu-course');
var log = require('bole')('customers/router');
var express = require('express');
var router = new express.Router();

function createCourse (req, res) {
  res.status(201).send();
}

function api (req, res) {
  res.render('api/api');
}
router.use('/education', require('./education/router'));
router.get('/', api);

module.exports = router;
