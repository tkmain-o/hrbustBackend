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
          const datalist = $('.datalist').find('tr');
          const result = {};
          result.data = [];
          result.gradeTerm = $('option:selected').text().replace(/\s/g, '');

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
            result.data.push(innerTexts);
          });
          result.cookie = cookie;
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
