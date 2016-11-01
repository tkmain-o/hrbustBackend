var express = require('express');
var join = require('path').join;

var router = new express.Router();

function home (req, res) {
  res.render('site/home');
}

function test (req, res) {
  res.render('site/test');
}

router.use(express.static(join(__dirname, '../../wwwroot')));
router.get('/', home);
router.get('/test', test);

module.exports = router;