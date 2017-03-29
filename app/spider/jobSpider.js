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
    mongoUtils.isExisted('Job', {
      id: item.id,
    }).then((result) => {
      if (!result) {
        const url = `http://job.hrbust.edu.cn/Companys/Show.aspx?id=${item.id}`;
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

    // 等待所有处理完成
    Promise.all(promiseList).then((values) => {
      const insertData = [];
      values.forEach((item) => {
        if (item) {
          insertData.push(item);
        }
      });
      // 如果数据长度大于零，插入数据库。
      if (insertData.length > 0) {
        // 数据库中插入新数据
        mongoUtils.insert('Job', insertData).then(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  });
  return promise;
}

function jobSpider(maxId, page, list) {
  let url = 'http://job.hrbust.edu.cn/Companys/List.aspx?zpXingshi=%E6%A0%A1%E5%9B%AD%E6%8B%9B%E8%81%98%E4%BC%9A';
  const dataList = list || [];
  const pageNum = page || 1;
  if (page) {
    url = `${url}&pagenum=${pageNum}`;
  }

  const promise = new Promise((resolve) => {
    superagent
      .get(url)
      .charset()
      .set(browserMsg)
      .end((err, response) => {
        if (err) {
          console.error('get job error');
          resolve({
            error: err,
          });
        } else {
          const body = response.text;
          const $ = cheerio.load(body);
          const idList = [];
          $('#ordered tr').each((index, item) => {
            if (index === 0) {
              // 第一条是标题
              return;
            }
            const href = $(item).find('a').attr('href');
            const title = $(item).find('a').text().trim();
            const id = href.match(/\d+/g)[0];
            const imageName = `jobId_${id}.jpg`;
            const date = $(item).find('td:nth-child(3)').text().trim();
            idList.push(id);
            dataList.push({
              title,
              id,
              date,
              imageName,
              sortId: id,
            });
          });
          if (Math.min(...idList) > maxId) {
            /*
              当前页面的最后一篇文章的 id 比数据库中的小
              才能证明已经将所有文章更新完毕
              否则加载下一页
            */
            jobSpider(maxId, pageNum + 1, dataList).then(() => {
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

module.exports = jobSpider;
