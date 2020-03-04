// 微信公众号
const router = require('koa-router')()
// const sha1 = require('sha1')
const wechat = require('co-wechat')
const config = require('../config/config').wxmp
const CetTicket = require('../models/CetTicket')
// model.id = nanoid()

router.prefix('/wxmp')

router.all('/', wechat(config).middleware(async (message) => {
  // await CetTicket.
  // console.log(message)
  if (/^CET_/.test(message.Content)) {
    const info = await CetTicket.findOne({
      uuid: message.Content,
    })

    if (info.ticket) {
      return `
        查询成功，
        您的 ${info.subjectName}准考证号码为：
        ${info.ticket}
      `
    }
    return '无效校验码，没有查询到您的准考证号，请重新获取校验码'
  }
  // subjectName
  return '欢迎使用理工喵~'
}))

// router.all('/', async (message) => {
//   console.log(message)
//   return 'hehe'
// })

module.exports = router
