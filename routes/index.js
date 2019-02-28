const router = require('koa-router')()

// router.get('/', async (ctx) => {
//   await ctx.render('index', {
//     title: 'Hello Koa 2!',
//   })
// })
router.get('/page/cet', async (ctx) => {
  await ctx.render('cet', {
    title: 'Hello Koa 2!',
  })
})

router.get('/string', async (ctx) => {
  ctx.body = ctx.session.id || 'fsdjfkhds'
})
let count = 0
router.get('/json', async (ctx) => {
  ctx.session.id = count
  count += 1
  // ctx.cookie = ctx.session.cookie
  ctx.body = {
    title: 'koa2 json',
  }
})

module.exports = router
