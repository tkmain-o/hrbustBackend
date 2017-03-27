const config = module.exports;
const PRODUCTION = process.env.NODE_ENV === 'production';
// const DEV = process.env.NODE_ENV === 'dev';

config.express = {
  port: process.env.EXPRESS_PORT || 4001,
  ip: '0.0.0.0',
};

config.mongodb = {
  port: process.env.MONGODB_PORT || 27017,
  host: process.env.MONGODB_HOST || 'localhost',
};

if (PRODUCTION) {
  config.express.ip = '0.0.0.0';
}
