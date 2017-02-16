const SimulateLogin = require('./util/simulateLogin').SimulateLogin;
const cheerio = require("cheerio");
const iconv = require("iconv-lite");
const charset = require('superagent-charset');
const superagent = charset(require('superagent'));

// 浏览器请求报文头部部分信息
const browserMsg = {
  "Accept-Encoding": "gzip, deflate",
  "Origin": "http://jwzx.hrbust.edu.cn",
  'Content-Type': 'application/x-www-form-urlencoded',
};

function handleGrade(cookie, year, term) {
  const promise = new Promise((resolve, reject) => {
    const data = {};
    if (year && term) {
      data.year = year;
      data.term = term;
      data.para = 0;
    }
    superagent
      .post("http://jwzx.hrbust.edu.cn/academic/manager/score/studentOwnScore.do?groupId=&moduleId=2020")
      .charset()
      .send(data)
      .set(browserMsg)
      .set("Cookie", cookie)
      .end((err, response, body) => {
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

          datalist.each((index, item) => {
            if (index === 0) {
              return;
            }
            const innerItems = $(item).find('td');
            const innerTexts = [];
            innerItems.each((indexI, itemI) => {
              let str = $(itemI).text().replace(/(\ +)|([ ])|([\r\n])/g, '');
              innerTexts.push(str);
            });
            result.data.push(innerTexts);
          });
          resolve(result);
        }
      });
  });
  return promise;
}

function getGrade(params) {
  var SimulateLoginParams = {
    username: params.username,
    password: params.password,
    callback: function(result) {
      if (result.error) {
        params.callback({
          error: result.error
        });
      } else {
        handleGrade(result.cookie, params.year, params.term).then((result) => {
          params.callback(result);
        }).catch(function () {
          console.log("Promise Rejected");
        });
      }
    },
    simulateIp: params.simulateIp,
    yourCookie: params.yourCookie
  }
  new SimulateLogin(SimulateLoginParams);
}

exports.getGrade = getGrade;
