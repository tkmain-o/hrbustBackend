const mongoose = require('mongoose')

const Schema = mongoose.Schema

const studentInfos = new mongoose.Schema({
  openId: {
    type: String,
  },
  students: [{
    type: Schema.Types.ObjectId,
    ref: 'StudentInfos',
  }],
  name: String,
  avatar: String,
  about: String,
  social: String,
}, {
  timestamps: true,
})

module.exports = mongoose.model('StudentInfos', studentInfos)
