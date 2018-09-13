const router = require('koa-router')()
const { wxLogin, updateUserInfo } = require('../controller/wechat/wx-login')

router.prefix('/api')

router.get('/wx-login', async (ctx) => wxLogin(ctx))

router.put('/userinfo', async (ctx) => updateUserInfo(ctx))

module.exports = router
