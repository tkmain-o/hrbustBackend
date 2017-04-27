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
const library = require('./edu-library');
const mongoUtils = require('../spider/mongoUtils');

function handleParams(req, callback) {
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

function getCet(req, res) {
  const num = req.query.username;
  eduGetCet.getCet(num).then((result) => {
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
// 获取所有信息列表
function getTimList(req, res) {
  mongoUtils.getTim().then((result) => {
    handleRes(result, res);
  });
}
// 增加Tim
function tim(req, res) {
  mongoUtils.addTim(req.body);
  handleRes({ code: 200, status: 'ok' }, res);
}
// 增加评论
function addComments(req, res) {
  mongoUtils.addComment(req.body.id, req.body).then(() => {
    handleRes({ code: 200, status: 'ok' }, res);
  });
}
// 点赞和踩
function comlikeordis(req, res) {
  mongoUtils.addCommentLikes(req.body.id, req.body.types, req.body.userid).then((result) => {
    handleRes(result, res);
  });
}
// 点击评论的赞和踩
function likeodis(req, res) {
  mongoUtils.addLikes(req.body.id, req.body.types, req.body.userid).then((result) => {
    handleRes(result, res);
  });
}
// 移除评论的赞
function removeCfavor(req, res) {
  mongoUtils.removeCommentLikes(req.body.id, req.body.types, req.body.userid).then((result) => {
    handleRes(result, res);
  });
}
// 移除tim的赞
function removefavor(req, res) {
  mongoUtils.removeLikes(req.body.id, req.body.types, req.body.userid).then((result) => {
    handleRes(result, res);
  });
}
// 移除评论
function removeC(req, res) {
  mongoUtils.removeComment(req.body.id).then((result) => {
    handleRes(result, res);
  });
}
// 移除tim
function removeTim(req, res) {
  mongoUtils.removeTim(req.body.id).then((result) => {
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
router.get('/getCet', getCet);
router.get('/getJob', getJob);
router.get('/library', libraryRouter);
router.get('/tim', getTimList);
router.post('/addTim', tim);
router.post('/addComment', addComments);
router.post('/commentsfavor', comlikeordis);
router.post('/favor', likeodis);
router.post('/removeCfavor', removeCfavor);
router.post('/removefavor', removefavor);
router.post('/removeComment', removeC);
router.post('/removeTim', removeTim);

module.exports = router;
