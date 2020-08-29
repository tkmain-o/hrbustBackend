// const { wxLogin, updateUserInfo, getUserInfo } = require('../controller/user/wx-login')
const PddClient = require('duoduoke-node-sdk')
const config = require('../../config/config')

const client = new PddClient({
  clientId: config.pdd.clientId,
  clientSecret: config.pdd.clientSecret,
  // endpoint: 'pinduoduo open endpoint', // 默认为 http://gw-api.pinduoduo.com/api/router
})

const search = async (ctx) => {
  const {
    keyword = '大学寝室必备',
    page = 1,
    page_size = 20,
    sort_type = 0,
    with_coupon = false,
  } = ctx.query

  const res = await client.execute('pdd.ddk.goods.search', {
    keyword,
    page,
    page_size,
    sort_type,
    with_coupon,
    ...ctx.query,
  })

  // console.log(keyword, page, res.goods_list)

  const goods_id_list = res.goods_list.map((good) => good.goods_id)

  // TODO 后续有商品详情之后，此接口需要移出，有性能问题
  const gRes = await client.execute('pdd.ddk.goods.promotion.url.generate', {
    goods_id_list,
    p_id: '9924289_153220051',
    generate_we_app: true,
  }).then((r) => {
    // 测试延迟 code
    // console.log(r, 'res')
    return r
  })

  ctx.body = {
    data: res.goods_list.map((good, index) => {
      return ({
        ...good,
        ...(gRes.goods_promotion_url_list[index] || {}),
      })
    }),
    status: 200,
  }
}

const keywords = async (ctx) => {
  ctx.body = {
    data: ['寝室神器', '毛巾', '壁纸', '衣架', '寝室灯', '洗发水', '纸巾'],
    status: 200,
  }
}
module.exports = {
  search,
  keywords,
}
