const router = require('koa-router')()
const { wxLogin, updateUserInfo, checkLogin } = require('../controller/wechat/wx-login')

router.prefix('/api/wechat')

router.get('/wx-login', async (ctx) => wxLogin(ctx))

router.put('/userinfo', async (ctx) => updateUserInfo(ctx))

router.get('/login/check', async (ctx) => checkLogin(ctx))

module.exports = router
