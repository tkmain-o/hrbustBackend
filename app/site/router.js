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

router.get('/test/test-page', (req, res) => {
  res.header('Content-Type', 'text/html;charset=utf-8');
  res.sendfile(join(__dirname, './index.html'));
});

router.get('/test-ele', (req, res) => {
  res.header('Content-Type', 'text/html;charset=utf-8');
  res.sendfile(join(__dirname, './test-ele.html'));
});

module.exports = router;
