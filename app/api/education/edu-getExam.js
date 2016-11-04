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

function getStudentId(cookie, callback) {
  superagent
    .get("http://jwzx.hrbust.edu.cn/academic/student/currcourse/currcourse.jsdo?groupId=&moduleId=2000")
    .charset()
    .set(browserMsg)
    .set("Cookie", cookie)
    .end((err, response, body) => {
      if (err) {
        loginHandlerInner(usernameW, passwordW, callback);
      } else {
        var body = response.text;
        var $ = cheerio.load(body);
        var str = $(".button")[0].attribs.onclick;
        var id = str.match(/id=(\S*)&yearid/)[1];
        console.log(id+"dfsd");
        callback(id);
      }
    });
}


function getExam (params) {
  console.log(params.yourCookie);
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
        getStudentId(result.cookie, function(id) {
          superagent
            .get("http://jwzx.hrbust.edu.cn/academic/student/exam/index.jsdo?stuid=" + id)
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
                console.log(body+'haha');
                var examInfo = {};
                $('.infolist_tab tr') && $('.infolist_tab tr').each((i, e) => {
                  examInfo[i] = [];
                  if (i == 0) {
                    $(e).children('th') && $(e).children('th').each((j, ele) => {
                      examInfo[i].push($(ele).text());
                    });
                    return;
                  }
                  $(e).children('td') && $(e).children('td').each((j, ele) => {
                    var str = $(ele).text();
                    strF = str.replace(/(\s+)|(javascript(.*);)|(&nbsp;)/g, "");;
                    examInfo[i].push(strF);
                  })
                });
                params.callback(examInfo);
              }
            });
        });
      }
    }
  }
  new SimulateLogin(SimulateLoginParams);
}

exports.getExam = getExam;
