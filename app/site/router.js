const express = require('express');
const join = require('path').join;

const router = new express.Router();

function home(req, res) {
  res.render('site/home');
}

function test(req, res) {
  res.render('site/test');
}

router.use(express.static(join(__dirname, '../../wwwroot')));
router.get('/', home);
router.get('/test', test);

module.exports = router;
