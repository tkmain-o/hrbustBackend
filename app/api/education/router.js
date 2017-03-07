const log = require('bole')('customers/router');
const express = require('express');

const router = new express.Router();

const eduLogin = require('./edu-login');
const eduGetCourse = require('./edu-getCourse');
const eduGetName = require('./edu-getName');
const eduGetExam = require('./edu-getExam');
const eduGetGrade = require('./edu-getGrade');
const eduGetWeek = require('./edu-getWeek');
const eduGetNews = require('./edu-getNews');
const eduGetCet = require('./edu-getCet');
const eduGetJob = require('./edu-getJob');

function handlerParams(req, callback) {
  const username = req.query.username;
  const password = req.query.password;
  const yourCookie = req.query.cookie;
  const simulateIp = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  return {
    username,
    password,
    yourCookie,
    simulateIp,
    callback,
  };
}

function getCourse(req, res) {
  var getCourseParmas = handlerParams(req, function(result) {
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

function getNews(req, res) {
  const page = req.query.page;
  eduGetNews.getNews(page).then((result) => {
    if (result.error) {
      log.error(result.error, 'error get exam');
      res.status(400).send(result.error);
      return;
    }
    res.json(result);
  });
}

function getCet(req,res){
  const num = req.query.username;
  eduGetCet.getCet(num).then((result) => {
    if(result.error){
      log.error(result.error,'error get cet');
      res.status(400).send(result.error);
      return;
    }
    res.json(result);
  });
}

function getJob(req,res) {
  const page = req.query.page;
  eduGetJob.getJob(page).then((result) => {
    if(result.error){
      log.error(result.error, 'error get job');
      res.status(400).send(result.error);
      return;
    }
    res.json(result);
  })
}
function home(req, res) {
  res.render('api/education/home');
}
router.get('/', home);
router.get('/getCourse', getCourse);
router.get('/login', login);
router.get('/getUserName', getUserName);
router.get('/getExam', getExam);
// router.post('/getGrade', getGrade);
router.get('/getGrade', getGrade);
router.get('/getWeek', getWeek);
router.get('/getNews', getNews);
router.get('/getCet',getCet);
router.get('/getJob',getJob);
module.exports = router;
