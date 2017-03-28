const mongoose = require('mongoose');

const News = new mongoose.Schema({
  newsId: { type: String, unique: true, required: true, index: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  imageName: { type: String, required: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model('news', News);
