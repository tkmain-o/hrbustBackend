// 微信公众号
const router = require('koa-router')()
// const sha1 = require('sha1')
const wechat = require('co-wechat')
const config = require('../config/config').wxmp

router.prefix('/wxmp')

router.all('/', wechat(config).middleware(async (message) => {
  console.log(message)
  return 'hehe'
}))

// router.all('/', async (message) => {
//   console.log(message)
//   return 'hehe'
// })

module.exports = router
