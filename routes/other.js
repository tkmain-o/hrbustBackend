const router = require('koa-router')()
const {
  media,
} = require('../controller/other/media')

router.prefix('/api')

router.post('/media', ctx => media(ctx))

module.exports = router
