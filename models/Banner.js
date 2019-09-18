/*
  首页Banner
*/

const mongoose = require('mongoose')

const BannerSchema = new mongoose.Schema({
  link: { type: String },
  image: { type: String, required: true },
  active: { type: Boolean, default: false },
  top: { type: Number },
  type: { type: Number, default: 0 }, // 0-link; 1-pageUrl
}, {
  timestamps: true,
})

module.exports = mongoose.model('Banner', BannerSchema)
