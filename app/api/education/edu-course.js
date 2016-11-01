var cheerio = require("cheerio");
var iconv = require("iconv-lite");
var charset = require('superagent-charset');
var superagent = charset(require('superagent'));

var SimulateLogin = require('./util/simulateLogin').SimulateLogin;

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
  console.log(cookie);
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
        var query = str.match(/do\?(\S*)sectionType=/)[1];
        console.log(query);
        console.log($(".button")[0].attribs.onclick);

        // "http://jwzx.hrbust.edu.cn/academic/manager/coursearrange/showTimetable.do?id=294152&yearid=36&termid=2&timetableType=STUDENT&sectionType=COMBINE"
        // "http://jwzx.hrbust.edu.cn/academic/manager/coursearrange/showTimetable.do?id=294152&yearid=36&termid=2&timetableType=STUDENT&sectionType=BASE"
        var urlFollower = "http://jwzx.hrbust.edu.cn/academic/manager/coursearrange/showTimetable.do?" + query + "sectionType=COMBINE";
        callback(urlFollower);
      }
    });
}
function getFollower(urlFollower, cookie, callback) {
  console.log(cookie);
  superagent
    .get(urlFollower)
    .charset()
    .set(browserMsg)
    .set("Cookie", cookie)
    .end((err, response, body) => {
      if (err) {
        loginHandlerInner(usernameW, passwordW, callback);
      } else {
        var body = response.text;
        var $ = cheerio.load(body);
        var result = {};
        var timetableArr = [];
        // timetableArr.content = [];
        var noArrangementArr = [];
        $("#timetable tr") && $("#timetable tr").each((i, e) => {
          timetableArr[i] = [];
          if (i == 0) {
            $(e).children('th') && $(e).children('th').each((j, ele) => {
              if (!j == 0) {
                timetableArr[i].push($(ele).text());
              }
            });
            return;
          }
          $(e).children('td') && $(e).children('td').each((j, ele) => {
            timetableArr[i].push($(ele).text());
          })
        });
        $('#noArrangement tr') && $('#noArrangement tr').each((i, e) => {
          noArrangementArr[i] = [];
          if (i == 0) {
            $(e).children('th') && $(e).children('th').each((j, ele) => {
              noArrangementArr[i].push($(ele).text());
            });
            return;
          }
          $(e).children('td') && $(e).children('td').each((j, ele) => {
            var str = $(ele).text();
            strF = str.replace(/(\s+)|(javascript(.*);)/g, "");;
            noArrangementArr[i].push(strF);
          })
        });
        result = Object.assign(result, { timetableArr, noArrangementArr });
        // console.log(noArrangementArr);
        callback(result);
      }
    });
}


function getCourse(u, p, callback, simulateIp, yourCookie, cookie) {

  new SimulateLogin('1305010420' ,'232331199301180823', function(result) {
    if (result.error) {
      console.log(error);
    } else {
      console.log(cookie);
    }
    callback(result);
  }, simulateIp, yourCookie);
}
exports.getCourse = getCourse;
