const cheerio = require('cheerio');
const charset = require('superagent-charset');
const superagent = charset(require('superagent'));

const getRandomIp = () => {
  const arr = [];
  for (let i = 0; i < 4; i += 1) {
    arr.push(Math.floor(Math.random() * 255));
  }
  return arr.join('.');
};

const browserMsg = {
  'Accept-Encoding': 'gzip, deflate',
  Origin: 'http://jwzx.hrbust.edu.cn',
  'Content-Type': 'application/x-www-form-urlencoded',
  'X-Forwarded-For': `${getRandomIp()}`,
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
