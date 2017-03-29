const cheerio = require('cheerio');
const charset = require('superagent-charset');
const superagent = charset(require('superagent'));
const Thenjs = require('thenjs');
const mongoUtils = require('./mongoUtils');
const log = require('bole')('spider.js');
const pushQiniuImage = require('./pushQiniuImage');

let thenjsList = Thenjs;
// 浏览器请求报文头部部分信息
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
function checkMongoAndPushQiniu(item) {
  // 检查数据库中是否已存储文章信息
  // 如果数据库中没有，上传至七牛
  const promise = new Promise((resolve) => {
    mongoUtils.isExisted('News', {
      id: item.id,
    }).then((result) => {
      if (!result) {
        const url = `http://jwzx.hrbust.edu.cn/homepage/infoSingleArticle.do?articleId=${item.id}&columnId=354`;
        log.info(url);
        pushQiniuImage(url, item.imageName).then(() => {
          resolve({
            data: item,
            handle: 'insert',
          });
        });
      } else {
        log.info('数据库中已经存在');
        resolve({
          data: item,
          handle: 'update',
        });
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

    // 等待所有处理完成
    Promise.all(promiseList).then((values) => {
      const insertData = [];
      // 现将所有数据库中已存置顶删除
      mongoUtils.update('News', { top: true }, { $set: { top: false }, $inc: { sortId: -9999999 } }).then(() => {
        values.forEach((item) => {
          if (item.handle === 'insert') {
            insertData.push(item.data);
          } else if (item.data.top) {
            // 已存在文章被置顶的情况。
            mongoUtils.update('News', { id: item.data.id }, { $set: { top: item.data.top }, $inc: { sortId: 9999999 } });
          }
        });
        // 如果数据长度大于零，插入数据库。
        if (insertData.length > 0) {
          // 数据库中插入新数据
          mongoUtils.insert('News', insertData).then(() => {
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  });
  return promise;
}

function newsSpider(maxId, page, list) {
  let url = 'http://jwzx.hrbust.edu.cn/homepage/infoArticleList.do?columnId=354&pagingNumberPer=4';

  const dataList = list || [];
  const pageNum = page || 1;

  if (page) {
    url = `${url}&pagingPage=${pageNum}`;
  }

  const promise = new Promise((resolve) => {
    superagent
      .get(url)
      .charset()
      .set(browserMsg)
      .end((err, response) => {
        if (err) {
          console.error('get news error');
          resolve({
            error: err,
          });
        } else {
          const body = response.text;
          const $ = cheerio.load(body);
          const idList = [];
          $('.articleList li').each((index, item) => {
            const href = $(item).find('a').attr('href');
            const title = $(item).find('a').text().replace(/\s/g, '');
            const id = parseInt(href.match(/articleId=(\S*)&/)[1]);
            const imageName = `articleId_${id}.jpg`;
            const date = $(item).find('span').text();
            // 是否置顶
            const top = $(item).find('img').attr('title') === '置顶';
            let sortId = id;

            if (top) {
              // 置顶 id
              sortId += 9999999;
            } else {
              // 不是置顶文章的列表
              idList.push(id);
            }

            dataList.push({
              title,
              id,
              date,
              imageName,
              top,
              sortId,
            });
          });
          if (idList.length === 0) {
            // 全是置顶文章，需要再加载下一页
            newsSpider(maxId, pageNum + 1, dataList).then(() => {
              resolve();
            });
          } else if (Math.min(...idList) > maxId) {
            /*
              当前页面的最后一篇文章的 id 比数据库中的小
              才能证明已经将所有文章更新完毕
              否则加载下一页
            */
            newsSpider(maxId, pageNum + 1, dataList).then(() => {
              resolve();
            });
          } else {
            // 抓取成功 处理数据库、七牛等。
            thenjsList = thenjsList.series([
              // 串行执行队列任务
              (cont) => {
                handleUpdateImage(dataList).then(() => {
                  resolve();
                  cont();
                });
              },
            ]);
          }
        }
      });
  });
  return promise;
}

module.exports = newsSpider;
