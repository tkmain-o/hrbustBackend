const config = require('../config');
const mongoose = require('mongoose');
const bole = require('bole');
const news = require('./index').news;
//
bole.output({ level: 'debug', stream: process.stdout });
const log = bole('onlyNews');
mongoose.Promise = global.Promise;
mongoose
  .connect(config.mongodb)
  .connection
  .on('error', log.error)
  .once('open', () => {
    // 启动爬虫
    news();
  });
