var course = require('./edu-course');
var log = require('bole')('customers/router');
var express = require('express');
var router = new express.Router();

function getCourse(req, res) {
  // console.log(req.query.username+'a');
  // console.log(req.query.password+'b');
  // console.log(req.query.cookie+'c');
  var username = req.query.username;
  var password = req.query.password;
  var yourCookie = req.query.cookie;
  var simulateIp = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  var getCourseParmas = {
    username,
    password,
    callback: function(result) {
      // console.log(result);
      if (result.error) {
        log.error(result.error, 'error get course');
        res.status(500).send(result.error);
        return;
      }
      res.json(result);
    },
    simulateIp,
    yourCookie,
  }
  course.getCourse(getCourseParmas);
}


function createCourse(req, res) {
  res.status(201).send();
}

function home(req, res) {
  res.render('api/education/home');
}
router.get('/', home);
// router.post('/course', getCourse);
router.get('/course', getCourse);

module.exports = router;
