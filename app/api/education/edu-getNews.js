const cheerio = require('cheerio');
const charset = require('superagent-charset');
const superagent = charset(require('superagent'));
const pushQiniuImage = require('./util/pushQiniuImage').pushQiniuImage;

// 浏览器请求报文头部部分信息
const browserMsg = {
  'Accept-Encoding': 'gzip, deflate',
  'Origin': 'http://jwzx.hrbust.edu.cn',
  'Content-Type': 'application/x-www-form-urlencoded',
};

function getNews(page) {
  let url = 'http://jwzx.hrbust.edu.cn/homepage/infoArticleList.do?columnId=354';

  if (page) {
    url = `${url}&pagingPage=${page}`;
  }

  const promise = new Promise((resolve, reject) => {
    superagent
      .get(url)
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
          const result = {};
          result.data = [];
          const promiseList = [];
          $('.articleList a').each((index, item) => {
            const href = $(item).attr('href');
            imageName = `articleId_${href.match(/articleId=(\S*)&/)[1]}.jpg`;
            result.data.push({
              title: $(item).text().replace(/\s/g, ''),
              imageName,
            });
            pushQiniuImage(`http://jwzx.hrbust.edu.cn/homepage/${href}`, imageName);
          });

          resolve(result);
        }
      });
  });
  return promise;
}

function getContent(url) {

  const promise = new Promise((resolve, reject) => {
    superagent
      .get(url)
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
          var $ = cheerio.load(body, {decodeEntities: false});
          resolve({
            content: $('.body').html().replace(/(\s)|(&nbsp;)/g, ' '),
          });
        }
      });
  });
  return promise;
}

exports.getNews = getNews;
