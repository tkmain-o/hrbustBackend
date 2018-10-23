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

const {
  getExam,
} = require('../controller/hrbust/exam')

const {
  getNews,
  getNewsDetail,
} = require('../controller/hrbust/news')

router.prefix('/api/hrbust')

router.get('/login', ctx => login(ctx))

router.get('/captcha', ctx => getCaptcha(ctx))

router.get('/week', ctx => getWeek(ctx))

router.get('/course', ctx => getCourse(ctx))

router.get('/updateCourse', ctx => updateCourse(ctx))

router.get('/getHasCourseTerms', ctx => getHasCourseTerms(ctx))

// 成绩
router.get('/grade', ctx => getGrade(ctx))

// 考试信息
router.get('/exam', ctx => getExam(ctx))

// 教务在线
router.get('/news', ctx => getNews(ctx))
router.get('/news/:id', ctx => getNewsDetail(ctx))

module.exports = router
