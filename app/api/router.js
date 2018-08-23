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
const getJobList = require('./edu-getJobHtml').getJobList;
const getJobDetail = require('./edu-getJobHtml').getJobDetail;
const getNewsList = require('./edu-getNewsHtml').getNewsList;
const getNewsDetail = require('./edu-getNewsHtml').getNewsDetail;
const library = require('./edu-library');
const fenban = require('./edu-fenban');
const { gaokaoluqu, luqukuaidi } = require('./edu-gaokaoluqu');
// const getNewStudentInfo = require('./edu-getNewStudentInfo');
const message = require('./edu-message');
const media = require('./media');
const testEle = require('./test-ele');

function handleParams(req, callback) {
  const username = req.query.username;
  const password = req.query.password;
  const yourCookie = req.query.cookie;
  const simulateIp = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  return Object.assign({
    username,
    password,
    yourCookie,
    simulateIp,
    callback,
  }, req.query);
}

function handleRes(result, res) {
  if (result.error) {
    log.error(result.error, 'error handleRes');
    res.status(400).json({
      error: result.error,
    });
    return;
  }
  res.json(result);
}


function getCourse(req, res) {
  const getCourseParmas = handleParams(req, (result) => {
    handleRes(result, res);
  });

  eduGetCourse.getCourse(getCourseParmas);
}

function login(req, res) {
  const loginParmas = handleParams(req, (result) => {
    handleRes(result, res);
  });
  eduLogin.login(loginParmas);
}

function getUserName(req, res) {
  const getNameParmas = handleParams(req, (result) => {
    handleRes(result, res);
  });
  eduGetName.getUserName(getNameParmas);
}

function getExam(req, res) {
  const page = req.query.page;
  const getExamParmas = handleParams(req, (result) => {
    handleRes(result, res);
  });
  eduGetExam.getExam(Object.assign({}, getExamParmas, {
    page,
  }));
}

function getGrade(req, res) {
  const getGradeParmas = {
    username: req.query.username,
    password: req.query.password,
    year: req.query.year,
    term: req.query.term,
    yourCookie: req.query.cookie,
    simulateIp: req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress,
    callback(result) {
      handleRes(result, res);
    },
  };

  eduGetGrade.getGrade(getGradeParmas);
}

function getWeek(req, res) {
  eduGetWeek.getWeek().then((result) => {
    handleRes(result, res);
  });
}

function getNews(req, res) {
  const page = req.query.page;
  const num = req.query.num;
  eduGetNews.getNews(page, num).then((result) => {
    handleRes(result, res);
  });
}

function getCetCaptcha(req, res) {
  eduGetCet.getCetCaptcha().then((result) => {
    handleRes(result, res);
  });
}

function getCet(req, res) {
  const name = req.body.name;
  const id = req.body.id;
  const username = req.body.username;
  const cookie = req.body.cookie || '';
  const yzm = req.body.yzm;
  eduGetCet.getCet(name, id, username, yzm, cookie.split(',')).then((result) => {
    handleRes(result, res);
  });
}

function getJob(req, res) {
  const page = req.query.page;
  const num = req.query.num;
  eduGetJob.getJob(page, num).then((result) => {
    handleRes(result, res);
  });
}

function libraryRouter(req, res) {
  const keyValue = req.query.keyValue;
  const page = req.query.page;
  library(keyValue, page).then((result) => {
    handleRes(result, res);
  });
}

function gaokaoluquRouter(req, res) {
  const name = req.query.name;
  const id = req.query.id;
  gaokaoluqu(name, id).then((result) => {
    handleRes(result, res);
  });
}

function fenbanRouter(req, res) {
  const name = req.query.name;
  const id = req.query.id;
  fenban(name, id).then((result) => {
    handleRes(result, res);
  });
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
router.get('/getJobList', getJobList);
router.get('/getJobDetail', getJobDetail);
router.get('/getNewsList', getNewsList);
router.get('/getNewsDetail', getNewsDetail);
router.post('/getCet', getCet);
router.get('/getCetCaptcha', getCetCaptcha);
router.get('/getJob', getJob);
router.get('/library', libraryRouter);
router.get('/gaokaoluqu', gaokaoluquRouter);
router.get('/luqukuaidi', luqukuaidi);
router.get('/fenban', fenbanRouter);

// router.get('/new_student_info', getNewStudentInfo);

// message
router.use('/message', message);
router.use('/media', media);

router.get('/test-ele', testEle);

module.exports = router;
