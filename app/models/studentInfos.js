const mongoose = require('mongoose');

const studentInfos = new mongoose.Schema({
  id: { type: Number, unique: true, required: true, index: true },
  password: { type: String, required: true },
  count: { type: Number, required: true },
  date: { type: String, required: true },
  name: { type: String, required: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model('studentInfos', studentInfos);
