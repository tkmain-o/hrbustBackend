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
  login_url: 'http://202.118.201.228/academic/common/security/login.jsp',
  captcha_url: 'http://202.118.201.228/academic/getCaptcha.do',
  check_url: 'http://202.118.201.228/academic/j_acegi_security_check?',
  index: 'http://202.118.201.228/academic/index.jsp',
  indexHeader: 'http://202.118.201.228/academic/showHeader.do',
  indexListLeft: 'http://202.118.201.228/academic/listLeft.do',
  index_new: 'http://202.118.201.228/academic/index_new.jsp',
};
// 浏览器请求报文头部部分信息
const browserMsg = {
  'Accept-Encoding': 'gzip, deflate',
  Origin: 'http://202.118.201.228',
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
        if (err) {
          console.error('get index is error');
          resolve({
            isValidCookie: false,
          });
        } else {
          const body = response.text;
          const $ = cheerio.load(body);
          const result = $('#date span').text();
          that.thisWeek = result.replace(/\s/g, '');
          const week = that.thisWeek.match(/第(\w*)周/)[1] ? parseInt(that.thisWeek.match(/第(\w*)周/)[1]) : 1;
          const terms = that.thisWeek.match(/(\w*)(秋|春)/);
          const year = parseInt(terms[1]) - 1980;
          const termsObj = {
            春: 1,
            秋: 2,
          };
          const term = termsObj[terms[2]];
          // 如果 lenght是0 证明未登陆 cookie 失效
          const flag = $('#menu li').length === 0;
          resolve({
            isValidCookie: !flag,
            term,
            year,
            week,
          });
        }
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
    const promise = new Promise((resolve) => {
      this.callback = resolve;
      checkCookie(this.cookie).then((data) => {
        this.term = data.term;
        this.year = data.year;
        this.week = data.week;
        if (data.isValidCookie) {
          this.callback(Object.assign({
            cookie: this.cookie,
          }, data));
        } else {
          this.cookie = '';
          this.getCookie();
        }
      }, this.cookie);
    });
    return promise;
  }

  getCookie() {
    if (this.simulateIp) {
      browserMsg['X-Forwarded-For'] = this.simulateIp;
    }
    superagent
      .post(url.login_url)
      .set(browserMsg)
      .redirects(0)
      .end((error, response) => {
        if (error) {
          this.callback({ error });
        }
        this.cookie = response.headers['set-cookie'][0].split(';')[0];
        console.warn(this.cookie);
        this.handlerCaptcha().then((captchaText) => {
          if (captchaText.error) {
            this.callback({
              error: captchaText.error,
            });
            return;
          }
          this.handlerLogin(captchaText);
        });
      });
  }

  captcha(callback) {
    // const that = this;
    const promise = new Promise((resolve) => {
      superagent
        .get(url.captcha_url)
        .buffer(true)
        .set(browserMsg)
        .set('Cookie', this.cookie)
        .end((error, response) => {
          if (error) {
            this.callback({ error });
          } else {
            const dataBuffer = new Buffer(response.body, 'base64');
            const captchaPath = path.resolve(__dirname, `../../cacheImages/${captchaCount}.jpg`);
            console.warn(`captchaCount: ${captchaCount}`);
            captchaCount += 1;
            fs.writeFile(captchaPath, dataBuffer, (err) => {
              if (err) throw err;
              getCaptcha(captchaPath).then((result) => {
                fs.unlinkSync(captchaPath);
                if (result.error) {
                  resolve({
                    error: result.error,
                  });
                  return;
                }
                let text = '';
                if (!result.error) {
                  // text = result && result.item ? result.item.result : '';
                  text = result && result.text ? result.text : '';
                }
                if (!result.text || result.predictable === 'False') {
                  // 识别错误重新识别
                  this.captcha(callback);
                  return;
                }
                callback(text);
              }).catch((e) => {
                resolve({
                  error: e,
                });
              });
            });
          }
        });
    });
    return promise;
  }

  handlerCaptcha() {
    return new Promise((resolve) => {
      this.captcha((text) => {
        resolve(text);
      });
    });
  }

  handlerLogin(captcha) {
    superagent
      .post(url.check_url)
      .send({
        j_username: this.username,
        j_password: this.password,
        j_captcha: captcha,
      })
      .set(browserMsg)
      .set('Cookie', this.cookie)
      .redirects(0)
      .end((err, response) => {
        const location = response.headers.location;
        if (location === url.index || location === url.index_new) {
          console.warn('all good');

          this.callback({
            cookie: response.headers['set-cookie'][0].split(';')[0],
            term: this.term,
            year: this.year,
            week: this.week,
          });
          // save student infomation to mongo
          this.updateMongo();
        } else {
          // handler error
          this.handlerError().then((errorText) => {
            if (errorText.match(/验证码/)) {
              // handler captcha again, then handler login again
              console.error(`验证码错误：${errorText}`);
              this.handlerCaptcha().then((captchaText) => {
                if (!captchaText || captchaText.error) {
                  this.callback({
                    error: captchaText.error || 'empty',
                  });
                  return;
                }
                this.handlerLogin(captchaText);
              });
            } else {
              this.callback({ error: errorText });
            }
          });
        }
      });
  }

  updateMongo() {
    superagent
      .get('http://202.118.201.228/academic/showHeader.do')
      .charset()
      .set(browserMsg)
      .set('Cookie', this.cookie)
      .redirects(0)
      .end((error, response) => {
        let name = '';
        if (!error) {
          const body = response.text;
          const $ = cheerio.load(body);
          name = $('#greeting span').text().split('(')[0];
        }

        mongoUtils.isExisted('StudentInfos', { id: this.username }).then((isExisted) => {
          if (isExisted) {
            mongoUtils.update('StudentInfos', { id: this.username }, { $inc: { count: 1 }, $set: { date: moment().format() }, password: this.password });
          } else {
            mongoUtils.insert('StudentInfos', { id: this.username, password: this.password, date: moment().format(), count: 1, name });
          }
        });
      });
  }

  handlerError() {
    const promise = new Promise((resolve) => {
      superagent
        .get('http://202.118.201.228/academic/common/security/login.jsp?login_error=1')
        .charset()
        .set(browserMsg)
        .set('Cookie', this.cookie)
        .end((error, response) => {
          if (error) {
            resolve(error);
          } else {
            const body = response.text;
            const $ = cheerio.load(body);
            const errorText = $('#message').text();
            resolve(errorText);
          }
        });
    });
    return promise;
  }
}

module.exports = SimulateLogin;
