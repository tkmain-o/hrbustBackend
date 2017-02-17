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

var cheerio = require("cheerio");
var charset = require('superagent-charset');
var superagent = charset(require('superagent'));
var Tesseract = require('tesseract.js');

var url = {
  login_url: "http://jwzx.hrbust.edu.cn/academic/common/security/login.jsp",
  captcha_url: "http://jwzx.hrbust.edu.cn/academic/getCaptcha.do",
  check_url: "http://jwzx.hrbust.edu.cn/academic/j_acegi_security_check?",
  index: "http://jwzx.hrbust.edu.cn/academic/index_new.jsp",
  indexHeader: "http://jwzx.hrbust.edu.cn/academic/showHeader.do",
  indexListLeft: "http://jwzx.hrbust.edu.cn/academic/listLeft.do"
};
// 浏览器请求报文头部部分信息
var browserMsg = {
  "Accept-Encoding": "gzip, deflate",
  "Origin": "http://jwzx.hrbust.edu.cn",
  "Content-Type": "application/x-www-form-urlencoded",
};
var count = 0;

function SimulateLogin (params) {
  this.username = params.username;
  this.password = params.password;
  this.callback = params.callback;
  this.simulateIp = params.simulateIp;
  this.cookie = params.yourCookie || '';
  var _this = this;
  _this.getWeek(function(error) {
    if (error) {
      _this.cookie = '';
      _this.getCookie();
    } else {
      _this.callback({
        cookie: _this.cookie,
        thisWeek: _this.thisWeek
      });
    }
  });
}
SimulateLogin.prototype.getCookie = function() {
  var _this = this;
  if (_this.simulateIp) {
    browserMsg['X-Forwarded-For'] = _this.simulateIp;
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
  // console.log(this.cookie,'this is test');
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
      if (response.headers.location == "http://jwzx.hrbust.edu.cn/academic/index_new.jsp" || response.headers.location == "http://jwzx.hrbust.edu.cn/academic/index.jsp") {
        //  all is good
        count ++;
        console.log(count, 'requst is good');
        _this.callback({
          cookie: _this.cookie,
          thisWeek: _this.thisWeek
        });
      } else {
        // handler error
        _this.handlerError((error) => {
          if (error.match(/验证码/)) {
            // handler captcha again, then handler login again
            _this.handlerCaptcha(function (captcha) {
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
SimulateLogin.prototype.getWeek = function (callback) {
  // http://jwzx.hrbust.edu.cn/academic/listLeft.do
  // http://jwzx.hrbust.edu.cn/academic/showHeader.do
  var _this = this;
  superagent
    .get(url.indexListLeft)
    .charset()
    .set(browserMsg)
    .set("Cookie", this.cookie)
    .redirects(0)
    .end((err, response, body) => {
      if (err) {
        console.log('get index is error');
        callback(true);
      } else {
        var body = response.text;
        var $ = cheerio.load(body);
        var result = $('#date span').text();
        _this.thisWeek = result.replace(/\s/g, "");
        if ($("#menu li").length == 0) {
          callback(true);
        } else {
          callback(false);
        }
      }
    });
}
exports.SimulateLogin = SimulateLogin;
