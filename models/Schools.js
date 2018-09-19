/*
  学校信息
*/

const mongoose = require('mongoose')

const Schema = mongoose.Schema
const SchoolSchema = new Schema({
  id: {
    type: Number, unique: true, required: true, index: true,
  },
  name: { type: String, required: true },
  // cookie: { type: String },
}, {
  timestamps: true,
})

module.exports = mongoose.model('Schools', SchoolSchema)
