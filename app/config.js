var config = module.exports;
var PRODUCTION = process.env.NODE_ENV === 'production';
var DEV = process.env.NODE_ENV === 'dev';

config.express = {
  port: process.env.EXPRESS_PORT || 4001,
  ip: '0.0.0.0'
};

if (PRODUCTION) {
  config.express.ip = '0.0.0.0'
}
