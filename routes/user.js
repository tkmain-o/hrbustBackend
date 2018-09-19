const router = require('koa-router')()
const { wxLogin, updateUserInfo, getUserInfo } = require('../controller/user/wx-login')

router.prefix('/api/user')

router.get('/wx-login', async (ctx) => wxLogin(ctx))

router.put('/userinfo', async (ctx) => updateUserInfo(ctx))

router.get('/userinfo', async (ctx) => getUserInfo(ctx))

module.exports = router
