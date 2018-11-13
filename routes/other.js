const router = require('koa-router')()
const {
  media,
} = require('../controller/other/media')

const {
  getBanner,
} = require('../controller/other/banner')

router.prefix('/api')

// 上传文件接口 七牛云
router.post('/media', ctx => media(ctx))

// 获取首页 banner
router.get('/banner', ctx => getBanner(ctx))

module.exports = router
