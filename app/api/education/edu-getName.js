var SimulateLogin = require('./util/simulateLogin').SimulateLogin;
var cheerio = require("cheerio");
var iconv = require("iconv-lite");
var charset = require('superagent-charset');
var superagent = charset(require('superagent'));

var url = {
  login_url: "http://jwzx.hrbust.edu.cn/academic/common/security/login.jsp",
  captcha_url: "http://jwzx.hrbust.edu.cn/academic/getCaptcha.do",
  check_url: "http://jwzx.hrbust.edu.cn/academic/j_acegi_security_check?"
};


// 浏览器请求报文头部部分信息
var browserMsg = {
  "Accept-Encoding": "gzip, deflate",
  "Origin": "http://jwzx.hrbust.edu.cn",
  'Content-Type': 'application/x-www-form-urlencoded',
};


function getUserName (params) {
  var SimulateLoginParams = {
    username: params.username,
    password: params.password,
    simulateIp: params.simulateIp,
    yourCookie: params.yourCookie,
    callback: function(result) {
      if (result.error) {
        params.callback({
          error: result.error
        });
      } else {
        superagent
          .get("http://jwzx.hrbust.edu.cn/academic/showHeader.do")
          .charset()
          .set(browserMsg)
          .set("Cookie", result.cookie)
          .redirects(0)
          .end((error, response, body) => {
            if (error) {
              params.callback({
                error
              });
            } else {
              var body = response.text;
              var $ = cheerio.load(body);
              var result = $('#greeting span').text();
              console.log(result);
              params.callback({
                name: result
              });
            }
          });
      }
    }
  }
  new SimulateLogin(SimulateLoginParams);
}

exports.getUserName = getUserName;
