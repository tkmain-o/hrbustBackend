const config = require('../config');
const mongoose = require('mongoose');
const debug = require('debug')('server');

const news = require('./index').news;
//
mongoose.Promise = global.Promise;
mongoose
  .connect(config.mongodb)
  .connection
  .on('error', debug)
  .once('open', () => {
    // 启动爬虫
    news();
  });
