const News = require('../models/news');
const Job = require('../models/job');
const StudentInfos = require('../models/studentInfos');
const Tim = require('../models/tim').Tim;
const Comments = require('../models/tim').Comment;
const log = require('bole')('mongo');

const collectionList = {
  News,
  Job,
  StudentInfos,
  Tim,
  Comments,
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
// 获取所有的tim列表包括评论
function getTim() {
  const promise = new Promise((resolve) => {
    Tim.find({}).populate('comments').exec((err, tim) => {
      resolve(tim);
    });
  });
  return promise;
}
// 增加评论
function addComment(id, data) {
  const promise = new Promise((resolve) => {
    Tim.findOne({ _id: id }, (err, tim) => {
      log.info(tim);
      if (err) {
        console.warn(err);
      }
      const comment = new Comments(data);
      tim.comments.push(comment);
      comment.save(() => {
        tim.save((error) => {
          if (error) {
            resolve(error);
          } else {
            log.info('添加comment成功');
            const result = {
              code: 200,
              status: 'ok',
            };
            resolve(result);
          }
        });
      });
    });
  });
  return promise;
}

// 增加tim
function addTim(data) {
  const promise = new Promise((resolve) => {
    const tim = new Tim(data);
    tim.save((err) => {
      if (err) {
        resolve(err);
      } else {
        log.info('添加tim成功');
        const result = {
          code: 200,
          status: 'ok',
        };
        resolve(result);
      }
    });
  });
  return promise;
}
// timelike
function addLikes(id, name, data) {
  const promise = new Promise((resolve) => {
    Tim.findOne({ _id: id }, (err, tim) => {
      tim[name].push(data);
      tim.save(() => {
        log.info('添加favor成功');
        const result = {
          code: 200,
          status: 'ok',
        };
        resolve(result);
      });
    });
  });
  return promise;
}
// 增加commentLikes或者dislike
function addCommentLikes(id, name, data) {
  const promise = new Promise((resolve) => {
    Comments.findOne({ _id: id }, (err, timcom) => {
      log.info(timcom);
      timcom[name].push(data);
      timcom.save((error) => {
        if (error) {
          resolve(error);
        } else {
          log.info('添加成功');
          const result = {
            code: 200,
            status: 'ok',
          };
          resolve(result);
        }
      });
    });
  });
  return promise;
}
function removeByValue(arr, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === val) {
      arr.splice(i, 1);
      break;
    }
  }
}
// 取消评论的like或dislike
function removeCommentLikes(id, name, data) {
  const promise = new Promise((resolve) => {
    Comments.findOne({ _id: id }, (err, timcom) => {
      removeByValue(timcom[name], data);
      timcom.save((error) => {
        if (error) {
          resolve(error);
        } else {
          log.info('移除commentlikes成功');
          const result = {
            code: 200,
            status: 'ok',
          };
          resolve(result);
        }
      });
    });
  });
  return promise;
}
// 删除评论
function removeComment(id) {
  const promise = new Promise((resolve) => {
    Comments.findOne({ _id: id }, (err, timcom) => {
      timcom.remove((error) => {
        if (error) {
          resolve(error);
        } else {
          log.info('移除comment成功');
          const result = {
            code: 200,
            status: 'ok',
          };
          resolve(result);
        }
      });
    });
  });
  return promise;
}
// 删除tim
function removeTim(id) {
  const promise = new Promise((resolve) => {
    Tim.findOne({ _id: id }, (err, tim) => {
      tim.remove((error) => {
        if (error) {
          resolve(error);
        } else {
          log.info('移除tim成功');
          const result = {
            code: 200,
            status: 'ok',
          };
          resolve(result);
        }
      });
    });
  });
  return promise;
}
// 取消tim的like或dislike
function removeLikes(id, name, data) {
  const promise = new Promise((resolve) => {
    Tim.findOne({ _id: id }, (err, tim) => {
      tim[name].removeByValue(data);
      tim.save((error) => {
        if (error) {
          resolve(err);
        } else {
          log.info('移除timlikes成功');
          const result = {
            code: 200,
            status: 'ok',
          };
          resolve(result);
        }
      });
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
exports.getTim = getTim;
exports.addTim = addTim;
exports.addComment = addComment;
exports.addCommentLikes = addCommentLikes;
exports.addLikes = addLikes;
exports.removeCommentLikes = removeCommentLikes;
exports.removeLikes = removeLikes;
exports.removeComment = removeComment;
exports.removeTim = removeTim;
