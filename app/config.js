const superConfig = require('../smackgg-config/hrbust-backend-config.json');

const config = module.exports;
const PRODUCTION = process.env.NODE_ENV === 'production';
// const DEV = process.env.NODE_ENV === 'dev';

config.express = {
  port: process.env.EXPRESS_PORT || 4001,
  ip: '127.0.0.1',
};

config.mongodb = `mongodb://${superConfig.user}:${superConfig.password}@${superConfig.host}:${superConfig.port}/${superConfig.database}?authSource=${superConfig.authSource}`;

if (PRODUCTION) {
  config.express.ip = '0.0.0.0';
}
