const SimulateLogin = require('./util/simulateLogin');
const cheerio = require('cheerio');
const charset = require('superagent-charset');
const superagent = charset(require('superagent'));
const gradeData = require('./util/getTestData').gradeData;

// 浏览器请求报文头部部分信息
const browserMsg = {
  'Accept-Encoding': 'gzip, deflate',
  Origin: 'http://202.118.201.228',
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
      .post('http://202.118.201.228/academic/manager/score/studentOwnScore.do?groupId=&moduleId=2020')
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

          const GRADE = {
            优: 95,
            优秀: 95,
            良: 85,
            良好: 85,
            中: 75,
            中等: 75,
            及格: 65,
            差: 0,
            不及格: 0,
          };

          // let gradeLength = 0;
          let gradeSum = 0;
          let GPA_SUM = 0;
          let XUE_FEN_SUM = 0;
          let OBLIGATORY_GPA_SUM = 0;
          let OBLIGATORY_FEN_SUM = 0;

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

            let GPA = '';
            if (xuefen > 0) {
              if (innerTexts[12] === '不及格') {
                GPA = '0.0';
              } else if (!Number.isNaN(grade)) {
                GPA = grade < 60 ? 0 : ((grade - 60) / 10) + 1;
                GPA = GPA.toFixed(1);
                gradeSum += grade * xuefen;
              } else {
                const cGrade = GRADE[innerTexts[6]];
                GPA = ((cGrade - 60) / 10) + 1;
                gradeSum += cGrade * xuefen;
              }
              GPA_SUM += xuefen * Number(GPA);
              XUE_FEN_SUM += xuefen;
              if (innerTexts[9] === '必修') {
                // 必修
                OBLIGATORY_GPA_SUM += xuefen * Number(GPA);
                OBLIGATORY_FEN_SUM += xuefen;
              }
            }
            innerTexts.push(GPA);
            result.data.push(innerTexts);
          });

          result.cookie = cookie;

          // GPA
          const AVERAGE_GPA = GPA_SUM / XUE_FEN_SUM;

          // 去选修 GPA
          const OBLIGATORY_AVERAGE_GPA = OBLIGATORY_GPA_SUM / OBLIGATORY_FEN_SUM;
          // 加权平均分
          const AVERAGE_GRADE = gradeSum / XUE_FEN_SUM;
          result.AVERAGE_GPA = AVERAGE_GPA.toFixed(2);
          result.AVERAGE_GRADE = AVERAGE_GRADE.toFixed(2);
          result.OBLIGATORY_AVERAGE_GPA = OBLIGATORY_AVERAGE_GPA.toFixed(2);
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
