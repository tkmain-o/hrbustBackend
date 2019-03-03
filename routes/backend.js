const router = require('koa-router')()
// const {
// addBanner
// } = require('../controller/backend')
const {
  getUsers,
  getCetHandler,
} = require('../controller/backend/cet')

router.prefix('/backend')

// 成绩
router.get('/cet/users', ctx => getUsers(ctx))
// cet

router.get('/cet', ctx => getCetHandler(ctx))

module.exports = router
