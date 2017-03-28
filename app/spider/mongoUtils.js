const News = require('../models/news');
const log = require('bole')('mongo');

// News.create({
//   newId: 12123
// }).then(() => {
//   console.warn('ok');
// }).catch((err) => {
//   if (err.code === 11000) {
//     console.warn('已经存在');
//   }
//   console.error(err);
// });
// News.findOne({ newId: 12123 }, (err, person) => {
//   if (err) {
//     log.info('err', err);
//   } else {
//     log.info('result', person);
//   }
// });
const collectionList = {
  News,
};

function isExisted(collection, query) {
  // 检查数据库中是否存在
  const promise = new Promise((resolve) => {
    collectionList[collection].findOne(query, (err, result) => {
      if (err) {
        log.info('err', err);
        resolve(false);
      } else {
        // log.info('result', result);
        resolve(!!result);
      }
    });
  });
  return promise;
}

function insert(collection, value) {
  // 检查数据库中是否存在
  log.info(value.newsId);
  const promise = new Promise((resolve, reject) => {
    collectionList[collection].create(value).then(() => {
      log.info('添加成功');
      resolve();
    }).catch((err) => {
      if (err.code === 11000) {
        log.warn('已经存在');
        resolve();
      }
      reject(err);
    });
  });
  return promise;
}

exports.isExisted = isExisted;
exports.insert = insert;
