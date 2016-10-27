var fs = require("fs");
var express = require("express");
var cheerio = require("cheerio");
var iconv = require("iconv-lite");
var charset = require('superagent-charset');
var superagent = charset(require('superagent'));
var http = require('http');
var Tesseract = require('tesseract.js');

var cookie;
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


var simulateLogin = (username, password) => {
  var loginResult = {};
  superagent
    .post(url.login_url)
    .set(browserMsg)
    .redirects(0)
    .end((err, response) => {
      cookie = response.headers["set-cookie"][0].split(';')[0];
      console.log(cookie);
      superagent
        .get(url.captcha_url)
        .buffer(true)
        .set(browserMsg)
        .set("Cookie", cookie)
        .end((err, response, body) => {
          if (err) {
            console.log(err);
          } else {
            console.log(response.body, 111);
            var dataBuffer = new Buffer(response.body, 'base64');
            fs.writeFile('out.jpg', response.body);
            console.log(dataBuffer, 222);
            Tesseract.recognize(dataBuffer)
              .then((result) => {
                var text = result.text;
                text = text.replace(/\s/g, "");
                var ex = (/^[0-9]*$/.test(text));
                if (!ex) {
                  simulateLogin(username, password);
                  return;
                }
                console.log(text);
                // superagent
                //   .post("http://jwzx.hrbust.edu.cn/academic/j_acegi_security_check?" + "j_username=" + username + "&j_password=" + password + "&j_captcha=" + result.text)
                //   .set(browserMsg)
                //   .set("Cookie", cookie)
                //   .redirects(0)
                //   .end((err, response) => {
                //     console.log(response);
                //     if (response.headers.location == "http://jwzx.hrbust.edu.cn/academic/index_new.jsp" || response.headers.location == "http://jwzx.hrbust.edu.cn/academic/index.jsp") {
                //       //  all is good
                //       getStudentId(cookie, (url) => {
                //         getFollower(url, cookie, callback);
                //       });
                //     } else {
                //       // handler error
                //       handlerError(cookie, (error) => {
                //         if (error.match(/验证码/)) {
                //           console.log("验证码错误");
                //           simulateLogin(username, password, callback);
                //           return;
                //         } else {
                //           callback(error)
                //           return false;
                //         }
                //       });
                //     }
                //   });
              })
          }
        });
    });
  return loginResult;
}

function handlerError(cookie, callback) {
  superagent
    .get("http://jwzx.hrbust.edu.cn/academic/common/security/login.jsp?login_error=1")
    .charset()
    .set(browserMsg)
    .set("Cookie", cookie)
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

module.exports = simulateLogin;
