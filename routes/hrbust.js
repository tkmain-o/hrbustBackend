const router = require('koa-router')()
const {
  login,
  getCaptcha,
  getWeek,
} = require('../controller/hrbust/login')

const {
  getCourse,
  getHasCourseTerms,
  updateCourse,
} = require('../controller/hrbust/course')

router.prefix('/api/hrbust')

router.get('/login', ctx => login(ctx))

router.get('/captcha', ctx => getCaptcha(ctx))

router.get('/week', ctx => getWeek(ctx))

router.get('/course', ctx => getCourse(ctx))

router.get('/updateCourse', ctx => updateCourse(ctx))

router.get('/getHasCourseTerms', ctx => getHasCourseTerms(ctx))

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
