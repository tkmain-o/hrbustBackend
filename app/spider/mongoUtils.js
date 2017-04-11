const News = require('../models/news');
const Job = require('../models/job');
const StudentInfos = require('../models/studentInfos');
const log = require('bole')('mongo');

const collectionList = {
  News,
  Job,
  StudentInfos,
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
  // 插入数据库
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

function update(collection, query, updates) {
  // 更新数据库
  const promise = new Promise((resolve, reject) => {
    collectionList[collection].update(query, updates, { multi: true }).then(() => {
      log.info('更新成功');
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

function findMax(collection, name) {
  // 查找某一键值中的最大值
  const promise = new Promise((resolve) => {
    collectionList[collection]
      .findOne()
      .sort(`-${name}`)
      .exec((err, member) => {
        // your callback code
        let id;
        if (member) {
          id = member.id;
        }
        resolve(id);
      });
  });
  return promise;
}

function getDataPagination(collection, sortName, page, num) {
  // 查找某一键值中的最大值

  const startCount = (page - 1) * num;
  const promise = new Promise((resolve) => {
    collectionList[collection].count({}, (err, count) => {
      if (startCount > count) {
        // 超出数据库中数据数量
        // log.info('超出数据库中数据数量');
        resolve([]);
      } else {
        collectionList[collection]
          .find()
          .sort(`-${sortName}`)
          .skip(startCount)
          .limit(num)
          .exec((errS, docs) => {
            resolve(docs);
          });
      }
    });
  });
  return promise;
}

exports.isExisted = isExisted;
exports.insert = insert;
exports.findMax = findMax;
exports.update = update;
exports.getDataPagination = getDataPagination;
