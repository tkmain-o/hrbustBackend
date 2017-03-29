const mongoose = require('mongoose');

const News = new mongoose.Schema({
  id: { type: Number, unique: true, required: true, index: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  imageName: { type: String, required: true },
  top: { type: Boolean, required: true },
  sortId: { type: Number, unique: true, required: true, index: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model('news', News);