const cheerio = require('cheerio');
const charset = require('superagent-charset');
const superagent = charset(require('superagent'));

const browserMsg = {
  'Accept-Encoding': 'gzip, deflate',
  Origin: 'http://jwzx.hrbust.edu.cn',
  'Content-Type': 'application/x-www-form-urlencoded',
};


function getWeek() {
  const promise = new Promise((resolve) => {
    superagent
      .get('http://jwzx.hrbust.edu.cn/academic/listLeft.do')
      .charset()
      .set(browserMsg)
      .end((err, response) => {
        if (err) {
          console.error('get index is error');
          resolve({
            error: err,
          });
        } else {
          const body = response.text;
          const $ = cheerio.load(body);
          const result = $('#date span').text();
          const thisWeek = result.replace(/\s/g, '');
          resolve({
            thisWeek,
          });
        }
      });
  });
  return promise;
}

exports.getWeek = getWeek;
