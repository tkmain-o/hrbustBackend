const config = require('../config');
const mongoose = require('mongoose');
const bole = require('bole');
const job = require('./index').job;
//
bole.output({ level: 'debug', stream: process.stdout });
const log = bole('onlyJob');
mongoose.Promise = global.Promise;
mongoose
  .connect(config.mongodb)
  .connection
  .on('error', log.error)
  .once('open', () => {
    // 启动爬虫
    job();
  });
