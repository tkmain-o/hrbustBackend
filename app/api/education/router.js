var log = require('bole')('customers/router');
var express = require('express');
var router = new express.Router();

var eduLogin = require('./edu-login');

var eduGetCourse = require('./edu-getCourse');
var eduGetName = require('./edu-getName');
var eduGetExam = require('./edu-getExam');
var eduGetGrade = require('./edu-getGrade');
var eduGetWeek = require('./edu-getWeek');

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
      res.status(400).send(result.error);
      return;
    }
    res.json(result);
  });

  eduGetCourse.getCourse(getCourseParmas);
}

function login(req, res) {
  var loginParmas = handlerParams(req, function(result) {
    if (result.error) {
      log.error(result.error, 'error login');
      res.status(400).send(result.error);
      return;
    }
    res.json(result);
  });
  eduLogin.login(loginParmas);
}

function getUserName(req, res) {
  var getNameParmas = handlerParams(req, function(result) {
    if (result.error) {
      log.error(result.error, 'error get userName');
      res.status(400).send(result.error);
      return;
    }
    res.json(result);
  })
  eduGetName.getUserName(getNameParmas);
}

function getExam(req, res) {
  var getExamParmas = handlerParams(req, function(result) {
    if (result.error) {
      log.error(result.error, 'error get exam');
      res.status(400).send(result.error);
      return;
    }
    res.json(result);
  })
  eduGetExam.getExam(getExamParmas);
}

function getGrade(req, res) {
  var getGradeParmas = {
    username: req.query.username,
    password: req.query.password,
    year: req.query.year,
    term: req.query.term,
    yourCookie: req.query.cookie,
    simulateIp: req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress,
    callback: function(result) {
      if (result.error) {
        log.error(result.error, 'error get exam');
        res.status(400).send(result.error);
        return;
      }
      res.json(result);
    }
  };

  eduGetGrade.getGrade(getGradeParmas);
}

function getWeek(req, res) {
  eduGetWeek.getWeek().then((result) => {
    if (result.error) {
      log.error(result.error, 'error get exam');
      res.status(400).send(result.error);
      return;
    }
    res.json(result);
  });
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
// router.post('/getGrade', getGrade);
router.get('/getGrade', getGrade);
router.get('/getWeek', getWeek);

module.exports = router;
