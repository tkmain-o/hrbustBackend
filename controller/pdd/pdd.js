// const { wxLogin, updateUserInfo, getUserInfo } = require('../controller/user/wx-login')
const PddClient = require('duoduoke-node-sdk')
const config = require('../../config/config')
const ShopKeywords = require('../../models/ShopKeywords')

const client = new PddClient({
  clientId: config.pdd.clientId,
  clientSecret: config.pdd.clientSecret,
  // endpoint: 'pinduoduo open endpoint', // 默认为 http://gw-api.pinduoduo.com/api/router
})

const search = async (ctx) => {
  const {
    keyword = '寝室神器',
    page = 1,
    page_size = 20,
    sort_type = 0,
    with_coupon = false,
    // flatform = '',
  } = ctx.query

  const res = await client.execute('pdd.ddk.goods.search', {
    keyword,
    page,
    page_size,
    sort_type,
    with_coupon,
    custom_parameters: JSON.stringify({ new: 1 }),
    ...ctx.query,
  })

  // 记录 keywords
  await ShopKeywords.findOneAndUpdate({ keyword }, {
    keyword,
    $inc: { count: 1 },
  }, {
    upsert: true,
  })

  // console.log(keyword, page, res.goods_list)

  // const goods_id_list = res.goods_list.map((good) => good.goods_id)
  // const goods_sign_list = res.goods_list.map((good) => good.goods_sign)

  // TODO 后续有商品详情之后，此接口需要移出，有性能问题
  // const gRes = await client.execute('pdd.ddk.goods.promotion.url.generate', {
  //   // goods_id_list,
  //   goods_sign_list,
  //   p_id: '9924289_189860448',
  //   generate_we_app: true,
  //   search_id: res.search_id,
  // }).then((r) => {
  //   // 测试延迟 code
  //   console.log(r.client, 'res')
  //   return r
  // })

  ctx.body = {
    data: res.goods_list.map((good) => {
      return ({
        ...good,
        // ...(gRes.goods_promotion_url_list[index] || {}),
      })
    }),
    status: 200,
  }
}

const generateGoods = async (ctx) => {
  const {
    goods_sign,
    search_id,
  } = ctx.query

  console.log(goods_sign)
  //  TODO 后续有商品详情之后，此接口需要移出，有性能问题
  const gRes = await client.execute('pdd.ddk.goods.promotion.url.generate', {
    // goods_id_list,
    goods_sign_list: [goods_sign],
    p_id: '9924289_189860448',
    generate_we_app: true,
    search_id,
  }).then((r) => {
    // 测试延迟 code
    console.log(r.client, 'res')
    return r
  })

  ctx.body = {
    data: gRes.goods_promotion_url_list[0] || {},
    status: 200,
  }
}

const keywords = async (ctx) => {
  ctx.body = {
    data: ['寝室神器', '毛巾', '壁纸', '衣架', '寝室灯', '洗发水', '纸巾'],
    status: 200,
  }
}

const channels = [{
  title: '宿舍用低功率吹风机',
  goods_sign_list: ['c9f2hBzZgshO-oLxwvbYu2IcGe03_J4rj9CVCu', 'c932sYS7etBO-oLxwvbYuyqrO073_JQx42SDhZG', 'c9L2tzGAVQpO-oLxwvbYu0VhJ_RE_JilyNQDYx', 'c9X2i6fVhLhO-oLxwvbYu9cOKVbG_JC2LiH4u2', 'c9z2h9Vv9FJO-oLxwvbYuxqo1pyR_JaoDpcGAj'],
}, {
  title: '寝室壁纸海报',
  goods_sign_list: ['c9b2u7sfectO-oLxwvbYu_UVJssU_JFDXa5EvD', 'c9b2tbZhMV5O-oLxwvbYu5Z-IoYR_JPzus9kod', 'c972u7nnB6lO-oLxwvbYu33FIFWa_Jj44m54ZG', 'c9r2uKjUYg1O-oLxwvbYuzqP2yYq_JiEzh2kbB', 'c9L2hX1FCHZO-oLxwvbYu-z3LoRn_JQQ4Ulngx2', 'c972iftxDa5O-oLxwvbYu6YVKEai_JOz2AM7Mo'],
}, {
  title: '酷毙灯/小夜灯',
  goods_sign_list: ['c932g3qET0RO-oLxwvbYuxTy9hzz_JpU7APU47', 'c9_2i0b1LztO-oLxwvbYu4SBXtaE_J1gy81f7B', 'c9r2hK6nfcpO-oLxwvbYu_sLsuuZ_JQ0wxo4WSU', 'c9L2hZkMG81O-oLxwvbYuxQMj92q_JJLFzjEtG'],
}]


const channel = async (ctx) => {
  const promises = channels.map(async (item) => {
    const res = await client.execute('pdd.ddk.goods.search', {
      goods_sign_list: item.goods_sign_list,
      pid: '9924289_189860448',
      page: 1,
      page_size: 10,
      // sort_type,
      // with_coupon,
      // custom_parameters: JSON.stringify({ new: 1 }),
    })
    return res
  })

  const res = await Promise.all(promises).then((results) => {
    return results.map((result, index) => ({
      title: channels[index].title,
      goods_list: result.goods_list,
    }))
    // data.push()
  })

  ctx.body = {
    data: res,
    status: 200,
  }
}


// const test = async () => {
//   const res = await client.execute('pdd.ddk.goods.search', {
//     // keyword: 'https://p.pinduoduo.com/ykXclQu6',
//     goods_sign_list: ['c9f2hBzZgshO-oLxwvbYu2IcGe03_J4rj9CVCu'],
//     pid: '9924289_189860448',
//     page: 1,
//     page_size: 10,
//     // sort_type,
//     // with_coupon,
//     // custom_parameters: JSON.stringify({ new: 1 }),
//   })

//   console.log(res)
// }

// test()


module.exports = {
  search,
  keywords,
  channel,
  generateGoods,
}
