const cheerio = require('cheerio');
const charset = require('superagent-charset');
const superagent = charset(require('superagent'));

const browserMsg = {
  'Accept-Encoding': 'gzip, deflate',
  Origin: 'http://202.118.201.228',
  'Content-Type': 'application/x-www-form-urlencoded',
};


function getWeek() {
  const promise = new Promise((resolve) => {
    superagent
      .get('http://202.118.201.228/academic/listLeft.do')
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
          const week = (thisWeek && thisWeek.match(/第(\w*)周/) && thisWeek.match(/第(\w*)周/)[1]) ? parseInt(thisWeek.match(/第(\w*)周/)[1]) : 1;
          const terms = thisWeek.match(/(\w*)(秋|春)/);
          const year = parseInt(terms[1]) - 1980;
          const termsObj = {
            春: 1,
            秋: 2,
          };
          const term = termsObj[terms[2]];
          resolve({
            thisWeek,
            term,
            year,
            week,
          });
        }
      });
  });
  return promise;
}

exports.getWeek = getWeek;
