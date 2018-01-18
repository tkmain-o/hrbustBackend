const SimulateLogin = require('./util/simulateLogin');
const cheerio = require('cheerio');
const charset = require('superagent-charset');
const superagent = charset(require('superagent'));
const gradeData = require('./util/getTestData').gradeData;

// 浏览器请求报文头部部分信息
const browserMsg = {
  'Accept-Encoding': 'gzip, deflate',
  Origin: 'http://jwzx.hrbust.edu.cn',
  'Content-Type': 'application/x-www-form-urlencoded',
};

function handleGrade(cookie, year, term) {
  const promise = new Promise((resolve) => {
    const data = {};
    if (year && term) {
      data.year = year;
      data.term = term;
      data.para = 0;
    }
    superagent
      .post('http://jwzx.hrbust.edu.cn/academic/manager/score/studentOwnScore.do?groupId=&moduleId=2020')
      .charset()
      .send(data)
      .set(browserMsg)
      .set('Cookie', cookie)
      .end((err, response) => {
        if (err) {
          resolve({
            error: err,
          });
        } else {
          const body = response.text;
          const $ = cheerio.load(body);

          // 需要教学评估
          const pingGuText = $('#content_margin').text().replace(/\s/g, '');
          if (pingGuText.indexOf('参加评教') >= 0) {
            resolve({
              data: pingGuText,
              status: -1,
              cookie,
            });
            return;
          }
          const datalist = $('.datalist').find('tr');
          const result = {};
          result.data = [];
          result.gradeTerm = $('option:selected').text().replace(/\s/g, '');

          const JI_DIAN = {
            优: '4.5',
            优秀: '4.5',
            良: '3.5',
            良好: '3.5',
            中: '2.5',
            中等: '2.5',
            及格: '1.5',
            差: '0',
            不及格: '0',
          };

          let gradeLength = 0;
          let gradeSum = 0;

          datalist.each((index, item) => {
            if (index === 0) {
              return;
            }
            const innerItems = $(item).find('td');
            const innerTexts = [];
            innerItems.each((indexI, itemI) => {
              const str = $(itemI).text().replace(/\s/g, '');
              innerTexts.push(str);
            });

            const grade = Number(innerTexts[6]);
            const xuefen = Number(innerTexts[7]);
            if (!Number.isNaN(grade)) {
              gradeLength += 1;
              gradeSum += grade;
            }

            let GPA = '';
            if (xuefen > 0) {
              if (innerTexts[12] === '不及格') {
                GPA = '0.0';
              } else if (!Number.isNaN(grade)) {
                GPA = grade < 60 ? 0 : ((grade - 60) / 10) + 1;
                GPA = GPA.toFixed(1);
              } else {
                GPA = JI_DIAN[innerTexts[6]];
              }
            }
            innerTexts.push(GPA);
            result.data.push(innerTexts);
          });
          let GPA_SUM = 0;
          let XUE_FEN_SUM = 0;
          result.data.forEach((item) => {
            const xuefen = Number(item[7]);
            const GPA = item[13] ? Number(item[13]) : null;
            if (GPA === '' || Number.isNaN(xuefen) || xuefen <= 0) {
              return;
            }
            GPA_SUM += xuefen * GPA;
            XUE_FEN_SUM += xuefen;
          });
          result.cookie = cookie;
          const AVERAGE_GPA = GPA_SUM / XUE_FEN_SUM;
          const AVERAGE_GRADE = gradeSum / gradeLength;
          result.AVERAGE_GPA = AVERAGE_GPA.toFixed(2);
          result.AVERAGE_GRADE = AVERAGE_GRADE.toFixed(2);
          resolve(result);
        }
      });
  });
  return promise;
}

function getGrade(params) {
  // 测试账号数据
  if (params.username === '1234' && params.password === '1234') {
    params.callback(gradeData);
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
      handleGrade(result.cookie, params.year, params.term).then((results) => {
        /* 此处的result报错*/
        params.callback(results);
      }).catch((error) => {
        console.error(error);
      });
    }
  });
}

exports.getGrade = getGrade;
