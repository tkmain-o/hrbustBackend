const router = require('koa-router')()
const wxLogin = require('./api/wx-login')

router.prefix('/api')

router.get('/wx-login', async (ctx) => {
  const { code } = ctx.request.query
  if (!code) ctx.throw(500)
  await wxLogin(ctx)
})

router.get('/login', async (ctx) => {
  const { code } = ctx.request.query
  if (!code) ctx.throw(500)
  await wxLogin(ctx)
})


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
