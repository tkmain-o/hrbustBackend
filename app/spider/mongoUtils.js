const News = require('../models/news');
const Job = require('../models/job');
const StudentInfos = require('../models/studentInfos');
const Tim = require('../models/tim').Tim;
const Comments = require('../models/tim').Comment;
const log = require('bole')('mongo');
const name = require('./randname');
const moment = require('moment');

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
// 获取所有的列表包括评论
function getTim(page) {
  const promise = new Promise((resolve) => {
    const startCount = (page - 1) * 5;
    Tim.find({}).populate('comments')
    .skip(startCount)
    .limit(10)
    .sort({ _id: -1})
    .exec((err, tim) => {
      resolve(tim);
    });
  });
  return promise;
}
// 获取未读信息数量
function notiCount(id) {
  const promise = new Promise((resolve) => {
    Comments.find({ replyTo: id, unread: true })
    .sort({ _id: -1 })
    .exec((err, tim) => {
      resolve(tim);
    });
  });
  return promise;
}
// 获取未读信息条目
function getNoti(id, page) {
  const promise = new Promise((resolve) => {
    const startCount = (page - 1) * 10;
    Comments.find({ replyTo: id, unread: true })
    .skip(startCount)
    .limit(10)
    .sort({ _id: -1 })
    .exec((err, tim) => {
      resolve(tim);
    });
  });
  return promise;
}
// 获取用户自己的条目
function getUserTim(openid, page) {
  const promise = new Promise((resolve) => {
    const startCount = (page - 1) * 10;
    Tim.find({ openid }).populate('comments')
    .skip(startCount)
    .limit(10)
    .sort({ _id: -1 })
    .exec((err, tim) => {
      resolve(tim);
    });
  });
  return promise;
}
//根据id查询条目，主要用于详细信息
function findOneTim(id) {
  const promise = new Promise((resolve) => {
    Tim.findOne({ _id: id }).populate('comments').exec((er, tim) => {
      resolve(tim);
    });
  });
  return promise;
}
// 增加条目的评论
function addComment(id, data) {
  const param = data;
  if (param.isAnonymous === 'true') {
    param.username = name.randname();
    param.avatar = '../../assert/avatar.png';
  }
  param.dateCreated = moment().format('MM-DD HH:mm');
  const promise = new Promise((resolve) => {
    Tim.findOne({ _id: id }, (err, tim) => {
      log.info(tim);
      if (err) {
        log.info(err);
      }
      const comment = new Comments(data);
      tim.comments.unshift(comment);
      tim.commentNum = tim.comments.length;
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

// 增加信息条目
function addTim(data) {
  const promise = new Promise((resolve) => {
    const param = data;
    let device = param.device.split('(');
    if (device.length > 1) {
      device.pop();
    }
    if (param.images[0] === '') {
      param.images.pop();
    }
    log.info(param.isFixed);
    if (param.isFixed === 'true') {
      log.info(param.isFixed);
      Tim.findOne({isFixed: 'true'},  (err, times) => {
        log.info(times);
        if (times) {
          times.isFixed = "false";
          times.save(() => {
            log.info('更改isFixed项成功');
          });
        }
      });
    }
    if (param.images[0] === '') {
      param.images.pop();
    }
    param.device = device;
    param.dateCreated = moment().format('MM-DD HH:mm');
    param.images = data.images.split(',');
    if (param.isAnonymous === 'true') {
      param.nickName = name.randname();
      param.avatar = '../../assert/avatar.png';
    }
    const tim = new Tim(param);
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
// 数据去重
function unique(ar) {
  const n = {};
  const r = [];
  for (let i = 0; i < ar.length; i++) {
        // 如果hash表中没有当前项
    if (!n[ar[i]]) {
            // 存入hash表
      n[ar[i]] = true;
            // 把当前数组的当前项push到临时数组里面
      r.push(ar[i]);
    }
  }
  return r;
}
// 根据值移除项
function removeByValue(arr, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === val) {
      arr.splice(i, 1);
      break;
    }
  }
}
// 点赞功能
function addLikes(like, id, data) {
  const promise = new Promise((resolve) => {
    Tim.findOne({ _id: id }, (err, tim) => {
      if (like === 'true') {
        tim.likes.push(data);
        tim.likes = unique(tim.likes);
      } else {
        tim.likes = unique(tim.likes);
        removeByValue(tim.likes, data);
      }
      tim.likeNum = tim.likes.length;
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
// 已读
function readed(id) {
  const promise = new Promise((resolve) => {
    Comments.findOne({ _id: id }, (err, tim) => {
      tim.unread = false;
      tim.save(() => {
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

// 删除评论
function removeComment(id) {
  const promise = new Promise((resolve) => {
    Comments.findOne({ _id: id }, (err, timcom) => {
      Tim.findOne({_id: timcom.cid}).exec((err, tim) => {
        tim.commentNum --;
        tim.save();
      });
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
// 删除条目
function removeTim(id) {
  const promise = new Promise((resolve) => {
    Tim.findOne({ _id: id }).populate('comments').exec((err, tim) => {
      for (let i = 0, len = tim.comments.length; i < len; i++) {
         Comments.findOne({ _id: tim.comments[i]._id }, (err, timcom) => {
            timcom.remove();
            log.info('移除评论成功');
         })
      }
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
exports.getTim = getTim;  // 获取信息条目
exports.addTim = addTim; // 增加信息条目
exports.addComment = addComment; //增加评论
exports.addLikes = addLikes; // 点赞
exports.removeComment = removeComment; // 移除评论
exports.removeTim = removeTim; // 移除条目
exports.findOneTim = findOneTim; // 条目详情
exports.getUserTim = getUserTim; // 获取用户所有的条
exports.notiCount = notiCount;  // 用户未读条目数目
exports.getNoti = getNoti; // 用户未读条目数量
exports.readed = readed; // 已读
