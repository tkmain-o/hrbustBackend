const cheerio = require("cheerio");
const charset = require('superagent-charset');
const superagent = charset(require('superagent'));

// 浏览器请求报文头部部分信息
const browserMsg = {
  "Accept-Encoding": "gzip, deflate",
  "Origin": "http://jwzx.hrbust.edu.cn",
  'Content-Type': 'application/x-www-form-urlencoded',
};


function getWeek (params) {
  const promise = new Promise((resolve, reject) => {
    superagent
      .get("http://jwzx.hrbust.edu.cn/academic/listLeft.do")
      .charset()
      .set(browserMsg)
      .end((err, response, body) => {
        if (err) {
          console.log('get index is error');
          resolve({
            error: err,
          });
        } else {
          var body = response.text;
          var $ = cheerio.load(body);
          var result = $('#date span').text();
          thisWeek = result.replace(/\s/g, "");
          resolve({
            thisWeek,
          });
        }
      });
  });
  return promise;
}

exports.getWeek = getWeek;
