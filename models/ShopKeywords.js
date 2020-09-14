/*
  首页Banner
*/

const mongoose = require('mongoose')

const ShopKeywordSchema = new mongoose.Schema({
  platform: { type: String },
  keyword: { type: String, required: true },
  count: { type: Number, default: 0 },
}, {
  timestamps: true,
})

module.exports = mongoose.model('ShopKeyword', ShopKeywordSchema)
