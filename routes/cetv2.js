const router = require('koa-router')()
// const {
// addBanner
// } = require('../controller/backend')
const {
  queryTicket,
  getCetCaptchaHandler,
} = require('../controller/other/cetv2')

router.prefix('/api/cetv2')

// 成绩
router.get('/queryTicket', ctx => queryTicket(ctx))

router.get('/captcha', ctx => getCetCaptchaHandler(ctx))
module.exports = router
