const cheerio = require('cheerio');
const charset = require('superagent-charset');
const superagent = charset(require('superagent'));
const Thenjs = require('thenjs');
const mongoUtils = require('./mongoUtils');
const log = require('bole')('spider.js');
const pushQiniuImage = require('./pushQiniuImage').pushQiniuImage;

let thenjsList = Thenjs;
// 浏览器请求报文头部部分信息
const browserMsg = {
  'Accept-Encoding': 'gzip, deflate',
  Origin: 'http://jwzx.hrbust.edu.cn',
  'Content-Type': 'application/x-www-form-urlencoded',
};
function checkMongoAndPushQiniu(item) {
  // 检查数据库中是否已存储文章信息
  // 如果数据库中没有，上传至七牛
  const promise = new Promise((resolve) => {
    mongoUtils.isExisted('News', {
      newsId: item.newsId,
    }).then((result) => {
      if (!result) {
        const url = `http://jwzx.hrbust.edu.cn/homepage/infoSingleArticle.do?articleId=${item.newsId}&columnId=354`;
        log.info(url);
        pushQiniuImage(url, item.imageName).then(() => {
          resolve(item);
        });
      } else {
        log.info('数据库中已经存在');
        resolve();
      }
    });
  });
  return promise;
}

function handleUpdateImage(dataList) {
  const promise = new Promise((resolve) => {
    const promiseList = [];
    dataList.forEach(async (item) => {
      promiseList.push(checkMongoAndPushQiniu(item));
    });
    Promise.all(promiseList).then((values) => {
      const data = values.reduce((arr, item) => {
        item && arr.push(item);
        return arr;
      }, []);
      // 如果数据长度大于零，插入数据库。
      data.length > 0 && mongoUtils.insert('News', data).then(() => {
        resolve();
      });
    });
  });
  return promise;
}

function newsSpider(page) {
  let url = 'http://jwzx.hrbust.edu.cn/homepage/infoArticleList.do?columnId=354&pagingNumberPer=4';

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
          $('.articleList li').each((index, item) => {
            const href = $(item).find('a').attr('href');
            const date = $(item).find('span').text();
            const newsId = href.match(/articleId=(\S*)&/)[1];
            const imageName = `articleId_${newsId}.jpg`;
            result.data.push({
              title: $(item).text().replace(/\s/g, ''),
              newsId,
              date,
              imageName,
            });
          });

          // 抓取成功 处理数据库、七牛等。
          thenjsList = thenjsList.series([
            // 串行执行队列任务
            (cont) => {
              handleUpdateImage(result.data).then(() => {
                resolve();
                cont();
              });
            },
          ]);
        }
      });
  });
  return promise;
}

exports.newsSpider = newsSpider;
// exports.getNewsThenjsList = thenjsList;
