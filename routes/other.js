const router = require('koa-router')()
const {
  media,
} = require('../controller/other/media')

const {
  getBanner,
} = require('../controller/other/banner')

const {
  getNews,
  getNewsDetail,
} = require('../controller/hrbust/news')

router.prefix('/api')

// 上传文件接口 七牛云
router.post('/media', ctx => media(ctx))

// 获取首页 banner
router.get('/banner', ctx => getBanner(ctx))

// 教务在线
router.get('/news', ctx => getNews(ctx))
router.get('/news/:id', ctx => getNewsDetail(ctx))

module.exports = router
