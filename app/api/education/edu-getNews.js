const cheerio = require('cheerio');
const charset = require('superagent-charset');
const superagent = charset(require('superagent'));
const pushQiniuImage = require('./util/pushQiniuImage').pushQiniuImage;
const Thenjs = require('thenjs');
const fs = require('fs');

const imageListPath = `${__dirname}/util/imageList.json`;

let thenjsList = Thenjs;

// 浏览器请求报文头部部分信息
const browserMsg = {
  'Accept-Encoding': 'gzip, deflate',
  Origin: 'http://jwzx.hrbust.edu.cn',
  'Content-Type': 'application/x-www-form-urlencoded',
};

function handleUpdateImage(imageObj) {
  const promise = new Promise((resolve) => {
    let imageObjJson = {};
    try {
      imageObjJson = JSON.parse(fs.readFileSync(imageListPath));
    } catch (e) {
      console.error(e);
    }
    const promiseList = [];
    const result = Object.keys(imageObj).reduce((obj, item) => {
      if (!imageObjJson[item]) {
        promiseList.push(pushQiniuImage(imageObj[item], item));
        return Object.assign({}, obj, {
          [item]: imageObj[item],
        });
      }
      return obj;
    }, imageObjJson);
    Promise.all(promiseList).then(() => {
      fs.writeFileSync(imageListPath, JSON.stringify(result));
      resolve();
    });
  });
  return promise;
}

function getNews(page) {
  let url = 'http://jwzx.hrbust.edu.cn/homepage/infoArticleList.do?columnId=354';

  if (page) {
    url = `${url}&pagingPage=${page}`;
  }

  const promise = new Promise((resolve) => {
    superagent
      .get(url)
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
          const result = {};
          result.data = [];
          const imageObj = {};
          $('.articleList a').each((index, item) => {
            const href = $(item).attr('href');
            const imageName = `articleId_${href.match(/articleId=(\S*)&/)[1]}.jpg`;
            result.data.push({
              title: $(item).text().replace(/\s/g, ''),
              imageName,
            });
            imageObj[imageName] = `http://jwzx.hrbust.edu.cn/homepage/${href}`;
          });

          thenjsList = thenjsList.series([
            // 串行执行队列任务
            (cont) => {
              handleUpdateImage(imageObj).then(() => {
                cont();
              });
            },
          ]);
          resolve(result);
        }
      });
  });
  return promise;
}

exports.getNews = getNews;
