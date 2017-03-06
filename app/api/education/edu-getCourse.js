const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const charset = require('superagent-charset');
const superagent = charset(require('superagent'));

const SimulateLogin = require('./util/simulateLogin').SimulateLogin;

const url = {
  login_url: 'http://jwzx.hrbust.edu.cn/academic/common/security/login.jsp',
  captcha_url: 'http://jwzx.hrbust.edu.cn/academic/getCaptcha.do',
  check_url: 'http://jwzx.hrbust.edu.cn/academic/j_acegi_security_check?'
};


// 浏览器请求报文头部部分信息
const browserMsg = {
  'Accept-Encoding': 'gzip, deflate',
  Origin: 'http://jwzx.hrbust.edu.cn',
  'Content-Type': 'application/x-www-form-urlencoded',
};


function getStudentId(cookie, callback) {
  superagent
    .get('http://jwzx.hrbust.edu.cn/academic/student/currcourse/currcourse.jsdo?groupId=&moduleId=2000')
    .charset()
    .set(browserMsg)
    .set('Cookie', cookie)
    .end((err, response) => {
      if (err) {
        loginHandlerInner(usernameW, passwordW, callback);
      } else {
        const body = response.text;
        const $ = cheerio.load(body);
        const str = $('.button')[0].attribs.onclick;
        const query = str.match(/do\?(\S*)sectionType=/)[1];
        // "http://jwzx.hrbust.edu.cn/academic/manager/coursearrange/showTimetable.do?id=294152&yearid=36&termid=2&timetableType=STUDENT&sectionType=COMBINE"
        // "http://jwzx.hrbust.edu.cn/academic/manager/coursearrange/showTimetable.do?id=294152&yearid=36&termid=2&timetableType=STUDENT&sectionType=BASE"
        const getCourseUrl = `http://jwzx.hrbust.edu.cn/academic/manager/coursearrange/showTimetable.do?${query}sectionType=COMBINE`;
        callback(getCourseUrl);
      }
    });
}

function handlerGetCourse(getCourseUrl, cookie, callback) {
  superagent
    .get(getCourseUrl)
    .charset()
    .set(browserMsg)
    .set('Cookie', cookie)
    .end((err, response) => {
      if (err) {
        callback(err);
      } else {
        const body = response.text;
        const $ = cheerio.load(body, { decodeEntities: false });
        let result = {};
        const courseArrange = [];
        const noArrangement = [];
        $('#timetable tr') && $('#timetable tr').each((i, e) => {
          if (i === 0) {
            return;
          }

          const course = [];
          $(e).children('td') && $(e).children('td').each((j, ele) => {
            if ($(ele).html() === '&nbsp;') {
              course.push(null);
            } else {
              let html = $(ele).html();
              html = html.replace(/(&lt;)|(&gt;)|(;.)/g, '');
              const arr = html.split('<br>');
              course.push(arr);
            }
          });
          courseArrange.push(course);
        });
        $('#noArrangement tr') && $('#noArrangement tr').each((i, e) => {
          noArrangement[i] = [];
          if (i === 0) {
            $(e).children('th') && $(e).children('th').each((j, ele) => {
              noArrangement[i].push($(ele).text());
            });
            return;
          }
          $(e).children('td') && $(e).children('td').each((j, ele) => {
            const str = $(ele).text();
            const strF = str.replace(/(\s+)|(javascript(.*);)|(&nbsp;)/g, '');
            noArrangement[i].push(strF);
          });
        });
        result = Object.assign(result, { courseArrange, noArrangement, cookie });
        callback(result);
      }
    });
}


function getCourse(params) {
  const SimulateLoginParams = {
    username: params.username,
    password: params.password,
    callback(result) {
      if (result.error) {
        params.callback({
          error: result.error,
        });
      } else {
        getStudentId(result.cookie, (getCourseUrl) => {
          handlerGetCourse(getCourseUrl, result.cookie, (res) => {
            params.callback(Object.assign(res, {thisWeek: result.thisWeek }));
          });
        });
      }
    },
    simulateIp: params.simulateIp,
    yourCookie: params.yourCookie,
  };
  new SimulateLogin(SimulateLoginParams);
}
exports.getCourse = getCourse;
