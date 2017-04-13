/**
 * new SimulateLogin(arguments)
 * SimulateLogin return a cookie
 * @param {object}
   * @param {string} username
   * @param {string} password
   * @param {function} callback(cookie)
   * @param {string} simulateIp
   * @param {string} yourCookie
 */

const cheerio = require('cheerio');
const charset = require('superagent-charset');
const superagent = charset(require('superagent'));
const getCaptcha = require('./captcha.js');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const mongoUtils = require('../../spider/mongoUtils');

moment.locale('zh-cn');

const url = {
  login_url: 'http://jwzx.hrbust.edu.cn/academic/common/security/login.jsp',
  captcha_url: 'http://jwzx.hrbust.edu.cn/academic/getCaptcha.do',
  check_url: 'http://jwzx.hrbust.edu.cn/academic/j_acegi_security_check?',
  index: 'http://jwzx.hrbust.edu.cn/academic/index.jsp',
  indexHeader: 'http://jwzx.hrbust.edu.cn/academic/showHeader.do',
  indexListLeft: 'http://jwzx.hrbust.edu.cn/academic/listLeft.do',
  index_new: 'http://jwzx.hrbust.edu.cn/academic/index_new.jsp',
};
// 浏览器请求报文头部部分信息
const browserMsg = {
  'Accept-Encoding': 'gzip, deflate',
  Origin: 'http://jwzx.hrbust.edu.cn',
  'Content-Type': 'application/x-www-form-urlencoded',
};
let captchaCount = 0;

function checkCookie(cookie) {
  const promise = new Promise((resolve) => {
    const that = this;
    superagent
      .get(url.indexListLeft)
      .charset()
      .set(browserMsg)
      .set('Cookie', cookie)
      .redirects(0)
      .end((err, response) => {
        let isValidCookie = false;
        if (err) {
          console.error('get index is error');
          isValidCookie = false;
        } else {
          const body = response.text;
          const $ = cheerio.load(body);
          const result = $('#date span').text();
          that.thisWeek = result.replace(/\s/g, '');
          // 如果 lenght是0 证明未登陆 cookie 失效
          const flag = $('#menu li').length === 0;
          isValidCookie = !flag;
        }
        resolve(isValidCookie);
      });
  });
  return promise;
}

class SimulateLogin {
  init(params) {
    this.username = params.username;
    this.password = params.password;
    this.simulateIp = params.simulateIp;
    this.cookie = params.yourCookie || '';
    const that = this;
    const promise = new Promise((resolve) => {
      that.callback = resolve;
      checkCookie(that.cookie).then((isValidCookie) => {
        if (isValidCookie) {
          that.callback({
            cookie: that.cookie,
            thisWeek: that.thisWeek,
          });
        } else {
          that.cookie = '';
          that.getCookie();
        }
      }, that.cookie);
    });
    return promise;
  }

  getCookie() {
    const that = this;
    if (that.simulateIp) {
      browserMsg['X-Forwarded-For'] = that.simulateIp;
    }
    superagent
      .post(url.login_url)
      .set(browserMsg)
      .redirects(0)
      .end((error, response) => {
        if (error) {
          that.callback({ error });
        }
        that.cookie = response.headers['set-cookie'][0].split(';')[0];
        console.warn(that.cookie);
        that.handlerCaptcha().then((captchaText) => {
          that.handlerLogin(captchaText);
        });
      });
  }

  handlerCaptcha() {
    const that = this;
    const promise = new Promise((resolve) => {
      superagent
        .get(url.captcha_url)
        .buffer(true)
        .set(browserMsg)
        .set('Cookie', that.cookie)
        .end((error, response) => {
          if (error) {
            that.callback({ error });
          } else {
            const dataBuffer = new Buffer(response.body, 'base64');
            const captchaPath = path.resolve(__dirname, `../../cacheImages/${captchaCount}.jpg`);
            console.warn(`captchaCount: ${captchaCount}`);
            captchaCount += 1;
            fs.writeFile(captchaPath, dataBuffer, (err) => {
              if (err) throw err;
              getCaptcha(captchaPath).then((result) => {
                let text = '';
                if (!result.error) {
                  text = result && result.item ? result.item.result : '';
                }
                fs.unlinkSync(captchaPath);
                resolve(text);
              });
            });
          }
        });
    });
    return promise;
  }

  handlerLogin(captcha) {
    const that = this;
    superagent
      .post(url.check_url)
      .send({
        j_username: that.username,
        j_password: that.password,
        j_captcha: captcha,
      })
      .set(browserMsg)
      .set('Cookie', that.cookie)
      .redirects(0)
      .end((err, response) => {
        const location = response.headers.location;
        if (location === url.index || location === url.index_new) {
          console.warn('all good');

          that.callback({
            cookie: that.cookie,
            thisWeek: that.thisWeek,
          });
          // save student infomation to mongo
          that.updateMongo();
        } else {
          // handler error
          that.handlerError().then((errorText) => {
            if (errorText.match(/验证码/)) {
              // handler captcha again, then handler login again
              that.handlerCaptcha().then((captchaText) => {
                that.handlerLogin(captchaText);
              });
            } else {
              that.callback({ error: errorText });
            }
          });
        }
      });
  }

  updateMongo() {
    const that = this;
    superagent
      .get('http://jwzx.hrbust.edu.cn/academic/showHeader.do')
      .charset()
      .set(browserMsg)
      .set('Cookie', that.cookie)
      .redirects(0)
      .end((error, response) => {
        let name = '';
        if (!error) {
          const body = response.text;
          const $ = cheerio.load(body);
          name = $('#greeting span').text().split('(')[0];
        }
        mongoUtils.isExisted('StudentInfos', { id: that.username }).then((isExisted) => {
          if (isExisted) {
            mongoUtils.update('StudentInfos', { id: that.username }, { $inc: { count: 1 }, $set: { date: moment().format() } });
          } else {
            mongoUtils.insert('StudentInfos', { id: that.username, date: moment().format(), count: 1, name });
          }
        });
      });
  }

  handlerError() {
    const promise = new Promise((resolve) => {
      superagent
        .get('http://jwzx.hrbust.edu.cn/academic/common/security/login.jsp?login_error=1')
        .charset()
        .set(browserMsg)
        .set('Cookie', this.cookie)
        .end((error, response) => {
          if (error) {
            resolve(error);
          } else {
            const body = response.text;
            const $ = cheerio.load(body);
            const errorText = $('#error').text();
            // console.warn(errorText);
            resolve(errorText);
          }
        });
    });
    return promise;
  }
}

module.exports = SimulateLogin;
