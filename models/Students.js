/*
  学生信息
*/

const mongoose = require('mongoose')

const Schema = mongoose.Schema
const StudentSchema = new mongoose.Schema({
  username: {
    type: Number, unique: true, required: true, index: true,
  },
  password: { type: String, required: true },
  count: { type: Number, default: 1 },
  // date: { type: String, required: true },
  name: { type: String, required: true },
  school: {
    type: Schema.Types.ObjectId,
    ref: 'Schools',
  },
  course: {
    type: Object,
  },
  // cookie: { type: String },
}, {
  timestamps: true,
})

module.exports = mongoose.model('Students', StudentSchema)
