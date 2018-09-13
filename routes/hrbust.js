const router = require('koa-router')()
const login = require('../controller/hrbust/login')

router.prefix('/api/hrbust')

router.get('/login', async (ctx) => {
  const { username, password } = ctx.request.query
  if (!username || !password) ctx.throw(400, '请求参数错误，登录需要用户名和密码')
  await login(ctx)
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
