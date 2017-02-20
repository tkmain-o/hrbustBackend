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
        // "http://jwzx.hrbust.edu.cn/academic/manager/coursearrange/showTimetable.do?id=294152&yearid=36&termid=2&timetableType=STUDENT&sectionType=COMBINE"
        // "http://jwzx.hrbust.edu.cn/academic/manager/coursearrange/showTimetable.do?id=294152&yearid=36&termid=2&timetableType=STUDENT&sectionType=BASE"
        var getCourseUrl = "http://jwzx.hrbust.edu.cn/academic/manager/coursearrange/showTimetable.do?" + query + "sectionType=COMBINE";
        callback(getCourseUrl);
      }
    });
}

function handlerGetCourse(getCourseUrl, cookie, callback) {
  superagent
    .get(getCourseUrl)
    .charset()
    .set(browserMsg)
    .set("Cookie", cookie)
    .end((err, response, body) => {
      if (err) {
        callback(err);
      } else {
        var body = response.text;
        var $ = cheerio.load(body, {decodeEntities: false});
        var result = {};
        var courseArrange = [];
        var noArrangement = [];
        $("#timetable tr") && $("#timetable tr").each((i, e) => {
          if (i == 0) {
            return;
          }

          const course = [];
          $(e).children('td') && $(e).children('td').each((j, ele) => {
            if ($(ele).html() == '&nbsp;') {
              course.push(null);
            } else {
              var html = $(ele).html();
              html = html.replace(/(&lt;)|(&gt;)|(;.)/g, "");
              var arr = html.split('<br>');
              course.push(arr);
            }
          })
          courseArrange.push(course);
        });
        $('#noArrangement tr') && $('#noArrangement tr').each((i, e) => {
          noArrangement[i] = [];
          if (i == 0) {
            $(e).children('th') && $(e).children('th').each((j, ele) => {
              noArrangement[i].push($(ele).text());
            });
            return;
          }
          $(e).children('td') && $(e).children('td').each((j, ele) => {
            var str = $(ele).text();
            strF = str.replace(/(\s+)|(javascript(.*);)|(&nbsp;)/g, "");;
            noArrangement[i].push(strF);
          })
        });
        result = Object.assign(result, { courseArrange, noArrangement, cookie });
        callback(result);
      }
    });
}


function getCourse(params) {
  var SimulateLoginParams = {
    username: params.username,
    password: params.password,
    callback: function(result) {
      if (result.error) {
        params.callback({
          error: result.error
        });
      } else {
        getStudentId(result.cookie, function(getCourseUrl) {
          handlerGetCourse(getCourseUrl, result.cookie, function(res) {
            params.callback(Object.assign(res, {thisWeek: result.thisWeek}));
          });
        })
      }
    },
    simulateIp: params.simulateIp,
    yourCookie: params.yourCookie
  }
  new SimulateLogin(SimulateLoginParams);
}
exports.getCourse = getCourse;
