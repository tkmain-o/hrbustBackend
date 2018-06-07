const SimulateLogin = require('./util/simulateLogin');
const cheerio = require('cheerio');
const charset = require('superagent-charset');
const superagent = charset(require('superagent'));
const getExamData = require('./util/getTestData').getExamData;

// 浏览器请求报文头部部分信息
const browserMsg = {
  'Accept-Encoding': 'gzip, deflate',
  Origin: 'http://202.118.201.228',
  'Content-Type': 'application/x-www-form-urlencoded',
};

function handleExam(cookie, page) {
  const url = `http://202.118.201.228/academic/manager/examstu/studentQueryAllExam.do?pagingPageVLID=${page || 1}&pagingNumberPerVLID=10&sortDirectionVLID=-1&sortColumnVLID=s.examRoom.exam.endTime&`;
  const promise = new Promise((resolve) => {
    const data = {};
    superagent
      .post(url)
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

          const allPageCount = $('.classicLookSummary').find('b').eq(2).text();
          if (parseInt(page) > parseInt(allPageCount)) {
            resolve(result);
            return;
          }

          datalist.each((index, item) => {
            if (index === 0) {
              return;
            }
            const innerItems = $(item).find('td');
            const itemData = {};
            itemData.examCourse = innerItems.eq(1).text();
            itemData.time = innerItems.eq(2).text();
            itemData.position = innerItems.eq(3).text();
            itemData.info = innerItems.eq(4).text();
            result.data.push(itemData);
          });
          result.cookie = cookie;
          resolve(result);
        }
      });
  });
  return promise;
}

function getExam(params) {
  // 测试账号数据
  if (params.username === '1234' && params.password === '1234') {
    if (params.page > 1) {
      params.callback({
        data: [],
      });
    } else {
      params.callback(getExamData());
    }
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
      handleExam(result.cookie, params.page).then((results) => {
        /* 此处的result报错*/
        params.callback(results);
      }).catch((error) => {
        console.error(error);
      });
    }
  });
}

exports.getExam = getExam;
