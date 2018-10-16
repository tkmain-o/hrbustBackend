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

const {
  getGrade,
} = require('../controller/hrbust/grade')

router.prefix('/api/hrbust')

router.get('/login', ctx => login(ctx))

router.get('/captcha', ctx => getCaptcha(ctx))

router.get('/week', ctx => getWeek(ctx))

router.get('/course', ctx => getCourse(ctx))

router.get('/updateCourse', ctx => updateCourse(ctx))

router.get('/getHasCourseTerms', ctx => getHasCourseTerms(ctx))

// 成绩
router.get('/grade', ctx => getGrade(ctx))

module.exports = router
