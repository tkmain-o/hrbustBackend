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
  if (/准考证/.test(message.Content)) {
    return [{
      title: '点击查询四六级准考证',
      description: '忘记准考证不用怕，理工喵帮您找回准考证~',
      picurl: 'http://hrbust-static.smackgg.cn/cetlogo.png',
      url: 'http://hrbust-web.smackgg.com/query/ticket',
    }]
  }

  if (/^CET_/.test(message.Content)) {
    const info = await CetTicket.findOne({
      uuid: message.Content,
    })

    if (info && info.ticket) {
      return [{
        title: `点击查询您的${info.subjectName.includes('四') ? '四' : '六'}级成绩`,
        description: `您的${info.subjectName}准考证号码为 ${info.ticket}`,
        picurl: 'http://hrbust-static.smackgg.cn/cetlogo.png',
        url: `http://hrbust-web.smackgg.com/query/cet?name=${info.name}&id=${info.ticket}`,
      }]
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
