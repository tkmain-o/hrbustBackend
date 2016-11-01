/**
 * new SimulateLogin(arguments)
 * SimulateLogin return a cookie
 * @param {string} username
 * @param {string} password
 * @param {function} callback(cookie)
 * @param {string} simulateIp
 * @param {string} yourCookie
 */

var cheerio = require("cheerio");
var charset = require('superagent-charset');
var superagent = charset(require('superagent'));
var Tesseract = require('tesseract.js');

var url = {
  login_url: "http://jwzx.hrbust.edu.cn/academic/common/security/login.jsp",
  captcha_url: "http://jwzx.hrbust.edu.cn/academic/getCaptcha.do",
  check_url: "http://jwzx.hrbust.edu.cn/academic/j_acegi_security_check?",
  indexHeader: "http://jwzx.hrbust.edu.cn/academic/showHeader.do"
};
// 浏览器请求报文头部部分信息
var browserMsg = {
  "Accept-Encoding": "gzip, deflate",
  "Origin": "http://jwzx.hrbust.edu.cn",
  "Content-Type": "application/x-www-form-urlencoded",
};
var count = 0;

function SimulateLogin (username, password, callback, simulateIp, yourCookie) {
  this.username = username;
  this.password = password;
  this.callback = callback;
  this.simulateIp = simulateIp;
  this.yourCookie = yourCookie;
  this.cookie = '';
  var _this = this;
  if (_this.simulateIp) {
    browserMsg['X-Forwarded-For'] = simulateIp;
  }

  superagent
    .post(url.login_url)
    .set(browserMsg)
    .redirects(0)
    .end((error, response) => {
      if (error) {
        _this.callback({
          error
        });
        return false;
      }
      _this.cookie = response.headers["set-cookie"][0].split(';')[0];
      console.log(_this.cookie);
      _this.handlerCaptcha(function(captcha) {
        _this.handlerLogin(captcha);
      });
    });
}
SimulateLogin.prototype.handlerCaptcha = function (callback) {
  console.log(this.cookie,'this is test');
  var _this = this;
  superagent
    .get(url.captcha_url)
    .buffer(true)
    .set(browserMsg)
    .set("Cookie", _this.cookie)
    .end((error, response, body) => {
      if (error) {
        _this.callback({
          error
        });
      } else {
        var dataBuffer = new Buffer(response.body, 'base64');
        Tesseract.recognize(dataBuffer)
          .then((result) => {
            var text = result.text;
            text = text.replace(/\s/g, "");
            // must pure number
            var ex = (/^[0-9]*$/.test(text));
            if (!ex) {
              _this.handlerCaptcha(callback);
              return;
            }
            callback(result.text);
          })
      }
    });
}

// Login (登陆)
SimulateLogin.prototype.handlerLogin = function (captcha) {
  var _this = this;
  superagent
    .post(url.check_url)
    .send({
       j_username: _this.username,
       j_password: _this.password,
       j_captcha: captcha
    })
    .set(browserMsg)
    .set("Cookie", _this.cookie)
    .redirects(0)
    .end((err, response) => {
      // console.log(response);
      if (response.headers.location == "http://jwzx.hrbust.edu.cn/academic/index_new.jsp" || response.headers.location == "http://jwzx.hrbust.edu.cn/academic/index.jsp") {
        //  all is good
        count ++;
        console.log(count, 'requst is good');
        _this.getInformation(function(name) {
          _this.callback({
            cookie: _this.cookie,
            username: name
          });
        });
      } else {
        // handler error
        _this.handlerError((error) => {
          if (error.match(/验证码/)) {
            // handler captcha again, then handler login again
            _this.handlerCaptcha(function(captcha) {
              _this.handlerLogin(captcha);
            });
            return;
          } else {
            _this.callback({
              error
            });
            return false;
          }
        });
      }
    });
}

// handler error
SimulateLogin.prototype.handlerError = function (callback) {
  superagent
    .get("http://jwzx.hrbust.edu.cn/academic/common/security/login.jsp?login_error=1")
    .charset()
    .set(browserMsg)
    .set("Cookie", this.cookie)
    .end((err, response, body) => {
      if (err) {
        callback(error);
      } else {
        var body = response.text;
        var $ = cheerio.load(body);
        var error = $("#error").text();
        console.log(error);
        callback(error);
        return error;
      }
    });
}
SimulateLogin.prototype.getInformation = function(callback) {
  // http://jwzx.hrbust.edu.cn/academic/listLeft.do
  // http://jwzx.hrbust.edu.cn/academic/showHeader.do
  superagent
    .get(url.indexHeader)
    .charset()
    .set(browserMsg)
    .set("Cookie", this.cookie)
    .end((err, response, body) => {
      if (err) {
        console.log('get index is error');
      } else {
        var body = response.text;
        console.log(body);
        var $ = cheerio.load(body);
        var result = $('#greeting span').text();
        callback(result);
      }
    });
}
exports.SimulateLogin = SimulateLogin;
