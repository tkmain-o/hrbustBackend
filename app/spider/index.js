const moment = require('moment');
const newsSpider = require('./newsSpider');
const jobSpider = require('./jobSpider');
const log = require('bole')('spider-main:');

moment.locale('zh-cn');
const CronJob = require('cron').CronJob;
const findMax = require('./mongoUtils').findMax;

// Seconds: 0-59
// Minutes: 0-59
// Hours: 0-23
// Day of Month: 1-31
// Months: 0-11
// Day of Week: 0-6

function news() {
  findMax('News', 'id').then((maxValue) => {
    const max = maxValue || 2692;
    log.info(`max: ${max}`);
    newsSpider(max).then((result) => {
      if (result && result.error) {
        news();
        return;
      }
      log.info('News finised this update', moment().format('MMM Do YYYY, h:mm:ss'));
    });
  });
}

function job() {
  findMax('Job', 'id').then((maxValue) => {
    const max = maxValue || 21592;
    log.info(`max: ${max}`);
    jobSpider(max).then((result) => {
      if (result && result.error) {
        job();
        return;
      }
      log.info('Job finised this update', moment().format('MMM Do YYYY, h:mm:ss'));
    });
  });
}

function spider() {
  log.info('start at', moment().format('MMM Do YYYY, h:mm:ss'));
  const newsCron = new CronJob({
    cronTime: '00 30 */4 * * *',
    onTick() {
      log.info('newsSpider: update at', moment().format('MMM Do YYYY, h:mm:ss'));
      news();
    },
    start: false,
    timeZone: 'Asia/Shanghai',
  });

  const jobCron = new CronJob({
    cronTime: '00 00 */3 * * *',
    onTick() {
      log.info('jobSpider: update at', moment().format('MMM Do YYYY, h:mm:ss'));
      job();
    },
    start: false,
    timeZone: 'Asia/Shanghai',
  });
  newsCron.start();
  jobCron.start();
}

exports.spider = spider;
exports.news = news;
exports.job = job;
