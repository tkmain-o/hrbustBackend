const SimulateLogin = require('./util/simulateLogin');
const cheerio = require('cheerio');
const charset = require('superagent-charset');
const superagent = charset(require('superagent'));

// 浏览器请求报文头部部分信息
const browserMsg = {
  'Accept-Encoding': 'gzip, deflate',
  Origin: 'http://202.118.201.228/academic/listLeft.do',
  'Content-Type': 'application/x-www-form-urlencoded',
};
function checkRes(url, cookie) {
  const promise = new Promise((resolve) => {
    const options = {
      'Accept-Encoding': 'gzip, deflate',
      Origin: 'http://202.118.201.228/academic/eva/index/resultlist.jsdo?groupId=&moduleId=506',
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    const checkUrl = `http://202.118.201.228/academic/eva/index/${url}`;
    superagent
      .get(checkUrl)
      .charset()
      .set(options)
      .set('Cookie', cookie)
      .end((err, response) => {
        if (err) {
          console.error('get job error');
          resolve({
            error: err,
          });
        } else {
          const body = response.text;
          console.warn(body);
          const $ = cheerio.load(body);
          // continue
          console.warn($);
        }
        resolve();
      });
  });
  return promise;
}
function handUrl(url, cookie) {
  const promise = new Promise((resolve) => {
    const promiseList = [];
    url.forEach((item) => {
      promiseList.push(checkRes(item, cookie));
    });
    console.warn(promiseList);
    Promise.all(promiseList).then((values) => {
      resolve(values);
    });
  });
  return promise;
}

function handlerAutoCheck(cookie) {
  const promise = new Promise((resolve) => {
    const url = 'http://202.118.201.228/academic/eva/index/resultlist.jsdo?groupId=&moduleId=506';
    superagent
      .get(url)
      .charset()
      .set(browserMsg)
      .set('Cookie', cookie)
      .end((err, response) => {
        if (err) {
          resolve({
            error: err,
          });
        } else {
          const bod = response.text;
          const urlList = [];
          const $ = cheerio.load(bod);
          const infolist = $('.center').find('.infolist');
          for (let i = 0; i < infolist.length; i++) {
            const ele = infolist[i];
            if (ele.attribs.href.indexOf('./evaindexinfo.jsdo?') === 0) {
              urlList.push(ele.attribs.href.substring(2));
            }
          }
          handUrl(urlList, cookie);
        }
      });
  });
  return promise;
}

function autocheck(params) {
  const SimulateLoginParams = {
    username: params.username,
    password: params.password,
    callback(result) {
      if (result.error) {
        params.callback({
          error: result.error,
        });
      } else {
        console.warn('hel');
      }
    },
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
      handlerAutoCheck(result.cookie);
    }
  });
}

exports.autocheck = autocheck;
