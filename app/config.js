const config = module.exports;
const PRODUCTION = process.env.NODE_ENV === 'production';
// const DEV = process.env.NODE_ENV === 'dev';

config.express = {
  port: process.env.EXPRESS_PORT || 4001,
  ip: '0.0.0.0',
};

config.mongodb = 'mongodb://107.170.52.153:27017/hrbust';

if (PRODUCTION) {
  config.express.ip = '0.0.0.0';
}
