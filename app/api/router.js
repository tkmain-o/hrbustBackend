const log = require('bole')('customers/router');
const express = require('express');
const requ = require('request');
const fs = require('fs');
const multiparty = require('multiparty');
const qiniu = require('node-qiniu');
const crypto = require('crypto');

const router = new express.Router();

const WXBizDataCrypt = require('./util/WXBizDataCrypt');
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
const name = require('../spider/randname');

const secret = '70e5c699fb26c6b1019fe4dc9ddae2f0';
const appid = 'wxb608c8252225731b';
qiniu.config({
  access_key: '6n1HQs5Yk2UGP7EJ1K3CsXXLbphiUTVvsYIZmncL',
  secret_key: 'XzgLuAQHwIlciJMYjLj9bmt3Qdc3Q383S2NDY0ni',
});
const imagesBucket = qiniu.bucket('hrbust');

function aesEncrypt(data, key) {
    const cipher = crypto.createCipher('aes192', key);
    var crypted = cipher.update(data, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

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

function home(req, res) {
  res.render('api/education/home');
}
// 获取预登录标志
function getConfigs(req, res) {
  handleRes({ data: { isInTest: false } }, res);
}
// 微信登录 start
function requestAsync(url) {
  return new Promise((reslove, reject) => {
    requ({ url }, (err, res, body) => {
      if (err) return reject(err);
      return reslove(body);
    });
  });
}

function getSessionKey(code) {
  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
  return requestAsync(url);
}
function wxlogin(req, res) {
  const code = req.headers['x-wechat-code'];
  getSessionKey(code).then((sk) => {
    const ssk = JSON.parse(sk);
    const sessionkey = ssk.session_key;
    const pc = new WXBizDataCrypt(appid, sessionkey);
    const data = pc.decryptData(req.headers['x-wechat-encrypted'], req.headers['x-wechat-iv']);
    data.session = sessionkey;
    handleRes({ data }, res);
  });
}
// 微信登录 end

// 点赞
function mklike(req, res) {
  mongoUtils.addLikes(req.body.like, req.body.bid, req.body.openId).then((result) => {
    handleRes(result, res);
  });
}
// 删除条目
function mkdelete(req, res) {
  console.warn(req.params);
  const id = req.params.id;
  mongoUtils.removeTim(id).then((result) => {
    handleRes(result, res);
  });
}
// 发表
function addBlog(req, res) {
  mongoUtils.addTim(req.body);
  handleRes({ code: 200, status: 'ok' }, res);
}
// 增加评论
function addBlogComment(req, res) {
  mongoUtils.addComment(req.body.bid, req.body).then(() => {
    handleRes({ code: 200, status: 'ok' }, res);
  });
}
function deleteBlogComment(req, res) {
  log.info(req.headers);
  mongoUtils.removeComment(req.params.id).then(() => {
    handleRes({ code: 200, status: 'ok' }, res);
  });
}
// 获取列表
function getBlog(req, res) {
  if(req.headers['x-wechat-session']){
    const page = req.query.page;
    mongoUtils.getTim(page).then((result) => {
      handleRes({ data: result }, res);
    });
  } else {
    handleRes({ code: 401, status: 'Unauthorized' }, res);
  }
}
// 获取用户自己的
function getUserBlog(req, res) {
   if(req.headers['x-wechat-session']){
    const page = req.query.page;
    const openid = req.query.openid;
    mongoUtils.getUserTim(openid, page).then((result) => {
      handleRes({ data: result }, res);
    });
   } else {
    handleRes({ code: 401, status: 'Unauthorized' }, res);
   }  
}
// 获取详情
function getBlogDetail(req, res) {
   if(req.headers['x-wechat-session']){
    const id = req.params.id;
    mongoUtils.findOneTim(id).then((result) => {
      handleRes({ data: result }, res);
    });
   } else {
     handleRes({ code: 401, status: 'Unauthorized' }, res);
   }
}
// 图片上传 start
function upImage(req, res) {
  // 生成multiparty对象，并配置上传目标路径
  const form = new multiparty.Form({ uploadDir: `${__dirname}/../cacheImages` });
  // 上传完成后处理
  form.parse(req, (err, fields, files) => {
    // const filesTmp = JSON.stringify(files, null, 2);

    if (err) {
      log.info(`parse error: ${err}`);
    } else {
      log.info(`parse files: ${files.file[0]}`);
      const inputFile = files.file[0];
      const uploadedPath = inputFile.path;
      const keys = name.randname();
      const imName = aesEncrypt(inputFile.originalFilename, keys);
      const dstPath = `${__dirname}/../cacheImages/${imName}`;
      // 重命名为真实文件名
      fs.rename(uploadedPath, dstPath, (error) => {
        if (error) {
          log.info(`rename error: ${error}`);
        } else {
          const imageName = imName;
          imagesBucket.putFile(imageName, dstPath, (ero, reply) => {
            try {
              fs.unlinkSync(dstPath);
              log.info(reply);
              handleRes({ errcode: 0, data: { url: `http://om478cuzx.bkt.clouddn.com/${imageName}` } }, res);
            } catch (er) {
              log.info(er);
            }
          });
          log.info('rename ok');
        }
      });
    }
  });
}
// 图片上传 end
// 获取未读数量
function notifications(req, res) {
  mongoUtils.notiCount(req.query.openid).then((result) => {
    const len = result.length;
    handleRes({ data: { unreadMessagesCount: len } }, res);
  });
}
// 获取未读条目
function getNoti(req, res) {
  mongoUtils.getNoti(req.query.openid, req.query.page).then((result) => {
    handleRes({ data: { unreadMessages: result } }, res);
  });
}
// 已经阅读
function hasRead(req, res) {
  mongoUtils.readed(req.params.id).then(() => {
    handleRes({ code: 200, status: 'ok' }, res);
  });
}

// 广告系统，以后加入
function ads(req, res) {
  handleRes({ code: 200, status: 'ok' }, res);
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
// wx小程序
router.get('/v2/configs', getConfigs);
router.post('/v2/user/wxlogin', wxlogin);
router.patch('/v2/blog/like', mklike);
router.delete('/v2/blog/delete/:id', mkdelete);
router.post('/v2/blogs', addBlog);
router.post('/v2/blog/image', upImage);
router.post('/v2/comments', addBlogComment);
router.delete('/v2/comments/:id', deleteBlogComment);
router.get('/v2/blogs', getBlog);
router.get('/v2/blogs/:id', getBlogDetail);
router.get('/v2/user', getUserBlog);
router.get('/v2/notifications', notifications);
router.get('/v2/notifications/messages', getNoti);
router.patch('/v2/notifications/:id', hasRead);
router.get('/v2/ads/:id', ads);
module.exports = router;
