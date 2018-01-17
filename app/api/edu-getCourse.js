const cheerio = require('cheerio');
const charset = require('superagent-charset');
const superagent = charset(require('superagent'));
const SimulateLogin = require('./util/simulateLogin');
const courseData = require('./util/getTestData').courseData;

// 浏览器请求报文头部部分信息
const browserMsg = {
  'Accept-Encoding': 'gzip, deflate',
  Origin: 'http://jwzx.hrbust.edu.cn',
  'Content-Type': 'application/x-www-form-urlencoded',
};


function getStudentId(cookie) {
  return new Promise((resolve) => {
    superagent
      .get('http://jwzx.hrbust.edu.cn/academic/student/currcourse/currcourse.jsdo?groupId=&moduleId=2000')
      .charset()
      .set(browserMsg)
      .set('Cookie', cookie)
      .end((err, response) => {
        if (err) {
          // callback(err);
        } else {
          const body = response.text;
          const $ = cheerio.load(body);
          const str = $('.button')[0].attribs.onclick;
          const id = str.match(/id=(\S*)&yearid/)[1];
          // "http://jwzx.hrbust.edu.cn/academic/manager/coursearrange/showTimetable.do?id=294152&yearid=36&termid=2&timetableType=STUDENT&sectionType=COMBINE"
          // "http://jwzx.hrbust.edu.cn/academic/manager/coursearrange/showTimetable.do?id=294152&yearid=36&termid=2&timetableType=STUDENT&sectionType=BASE"
          const getCourseUrl = `http://jwzx.hrbust.edu.cn/academic/manager/coursearrange/showTimetable.do?id=${id}&timetableType=STUDENT&sectionType=COMBINE`;
          resolve(getCourseUrl);
        }
      });
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
              const courseArrI = [];
              for (let i1 = 0; i1 < (arr.length / 5); i1++) {
                const courseItem = {};
                courseItem.title = arr[0 + (i1 * 5)];
                courseItem.position = arr[1 + (i1 * 5)];
                courseItem.teacher = arr[2 + (i1 * 5)];
                courseItem.messege = arr[4 + (i1 * 5)];

                const week = arr[3 + (i1 * 5)];
                courseItem.week = week;
                courseItem.weekObj = {};
                if (/第/.test(week)) {
                  // 只有一周
                  courseItem.weekObj.start = week.match(/第(\w*)周/) && parseInt(week.match(/第(\w*)周/)[1]);
                  courseItem.weekObj.end = week.match(/第(\w*)周/) && parseInt(week.match(/第(\w*)周/)[1]);
                } else if (/-/.test(week)) {
                  // 单周
                  if (/单周/.test(week)) {
                    const weekH = week.replace(/单周/, '').split('-');
                    courseItem.weekObj.start = parseInt(weekH[0]);
                    courseItem.weekObj.end = parseInt(weekH[1]);
                    courseItem.weekObj.parity = '单周';
                  } else if (/双周/.test(week)) {
                    // 双周
                    const weekH = week.replace(/双周/, '').split('-');
                    courseItem.weekObj.start = parseInt(weekH[0]);
                    courseItem.weekObj.end = parseInt(weekH[1]);
                    courseItem.weekObj.parity = '双周';
                  } else {
                    const weekH = week.replace(/周/, '').split('-');
                    courseItem.weekObj.start = parseInt(weekH[0]);
                    courseItem.weekObj.end = parseInt(weekH[1]);
                  }
                }
                courseArrI.push(courseItem);
              }

              course.push(courseArrI);
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
  // 测试账号数据
  if (params.username === '1234' && params.password === '1234') {
    params.callback(courseData);
    return;
  }

  const SimulateLoginParams = {
    username: params.username,
    password: params.password,
    simulateIp: params.simulateIp,
    yourCookie: params.yourCookie,
  };
  const simulateLogin = new SimulateLogin();
  simulateLogin.init(SimulateLoginParams).then((result) => {
    if (result.error) {
      params.callback({
        error: result.error,
      });
    } else {
      getStudentId(result.cookie).then((getCourseUrl) => {
        handlerGetCourse(`${getCourseUrl}&termid=${params.term}&yearid=${params.year}`, result.cookie, (res) => {
          params.callback(Object.assign(res, { thisWeek: result.thisWeek }));
        });
      });
    }
  });
}
exports.getCourse = getCourse;
