// const debug = require('debug')('techmeme-backend:error');
const { promisify } = require('util')
const redis = require('redis')
const redisClient = redis.createClient()
const config = require('../config/config')

redisClient.getAsync = promisify(redisClient.get).bind(redisClient);

const PRODUCTION = process.env.NODE_ENV === 'production'

let mongodb = 'mongodb://127.0.0.1:27017/hrbust'
let sessionSecret = 'test'

if (PRODUCTION) {
  const { mongo } = config
  mongodb = `mongodb://${mongo.user}:${mongo.password}@${mongo.host}:${mongo.port}/${mongo.database}?authSource=${mongo.authSource}`;
  ({ sessionSecret } = config)
}

module.exports = {
  mongodb,
  sessionSecret,
  redis: redisClient,
}
