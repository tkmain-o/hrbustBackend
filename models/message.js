const mongoose = require('mongoose')

const Message = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  image: { type: String, required: true },
  // content: { type: String, required: true },
  link: { type: String, required: true },
  // contentImage: String,
}, {
  timestamps: true,
})

module.exports = mongoose.model('Message', Message)
