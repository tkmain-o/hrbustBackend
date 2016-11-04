var log = require('bole')('customers/router');
var express = require('express');
var router = new express.Router();

var eduCourse = require('./edu-course');
var eduLogin = require('./edu-login');
var eduGetName = require('./edu-getName');
var eduGetExam = require('./edu-getExam');

function handlerParams(req, callback) {
  var username = req.query.username;
  var password = req.query.password;
  var yourCookie = req.query.cookie;
  var simulateIp = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  return {
    username,
    password,
    yourCookie,
    simulateIp,
    callback
  };
}

function getCourse(req, res) {
  var getCourseParmas = handlerParams(req, function(result) {
    // console.log(result);
    if (result.error) {
      log.error(result.error, 'error get course');
      res.status(500).send(result.error);
      return;
    }
    res.json(result);
  });

  eduCourse.getCourse(getCourseParmas);
}

function login(req, res) {
  var loginParmas = handlerParams(req, function(result) {
    if (result.error) {
      log.error(result.error, 'error get course');
      res.status(500).send(result.error);
      return;
    }
    res.json(result);
  });
  eduLogin.login(loginParmas);
}

function getUserName(req, res) {
  var getNameParmas = handlerParams(req, function(result) {
    if (result.error) {
      log.error(result.error, 'error get course');
      res.status(500).send(result.error);
      return;
    }
    res.json(result);
  })
  eduGetName.getUserName(getNameParmas);
}

function getExam(req, res) {
  var getNameParmas = handlerParams(req, function(result) {
    if (result.error) {
      log.error(result.error, 'error get course');
      res.status(500).send(result.error);
      return;
    }
    res.json(result);
  })
  eduGetExam.getExam(getNameParmas);
}
// function createCourse(req, res) {
//   res.status(201).send();
// }

function home(req, res) {
  res.render('api/education/home');
}
router.get('/', home);
// router.post('/course', getCourse);
router.get('/getCourse', getCourse);
router.get('/login', login);
router.get('/getUserName', getUserName);
router.get('/getExam', getExam);

module.exports = router;
