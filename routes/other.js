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

const {
  cetOrder,
  orderInfo,
} = require('../controller/other/cet-order')

router.prefix('/api')

// 上传文件接口 七牛云
router.post('/media', ctx => media(ctx))

// 获取首页 banner
router.get('/banner', ctx => getBanner(ctx))

// 教务在线
router.get('/news', ctx => getNews(ctx))
router.get('/news/:id', ctx => getNewsDetail(ctx))

router.post('/cet-order', ctx => cetOrder(ctx))
router.get('/order-info', ctx => orderInfo(ctx))
module.exports = router
