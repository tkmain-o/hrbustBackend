const Banner = require('../../models/Banner')

const getBanner = async (ctx) => {
  const list = await Banner.find({ active: true }).sort({ top: 1 })
  ctx.body = {
    data: list || [],
    status: 200,
  }
}

module.exports = {
  getBanner,
}
