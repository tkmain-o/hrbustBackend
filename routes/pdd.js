const router = require('koa-router')()
const {
  search, keywords, generateGoods, channel,
} = require('../controller/pdd/pdd')


router.prefix('/api/pdd')

// client.execute('pdd.ddk.goods.promotion.url.generate', {
//   goods_id_list: ['144895190635', '142400465570'],
//   p_id: '9924289_153220051',
//   generate_we_app: true
// }).then((res) => console.log(res))


router.get('/search', async (ctx) => search(ctx))
router.get('/keywords', async (ctx) => keywords(ctx))
router.get('/generateGoods', async (ctx) => generateGoods(ctx))
router.get('/channel', async (ctx) => channel(ctx))

module.exports = router
