const router = require('koa-router')()
const { wxLogin, updateUserInfo } = require('../controller/wechat/wx-login')

router.prefix('/api')

router.get('/wx-login', async (ctx) => wxLogin(ctx))

router.put('/userinfo', async (ctx) => updateUserInfo(ctx))

// router.get('/login', async (ctx) => {
//   const { code } = ctx.request.query
//   if (!code) ctx.throw(500)
//   await wxLogin(ctx)
// })


// router.get('/login', async (ctx) => {
//   const { code } = ctx.request.query
//   if (!code) ctx.throw(500)
// })

//
// router.get('/string', async (ctx) => {
//   ctx.body = 'koa2 string'
// })
//
// router.get('/json', async (ctx) => {
//   ctx.body = {
//     title: 'koa2 json',
//   }
// })

module.exports = router
