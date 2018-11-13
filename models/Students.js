/*
  学生信息
*/

const mongoose = require('mongoose')

const Schema = mongoose.Schema
const StudentSchema = new mongoose.Schema({
  username: {
    type: String, unique: true, required: true, index: true,
  },
  password: { type: String, required: true },
  count: { type: Number, default: 1 },
  // date: { type: String, required: true },
  name: { type: String, required: true },
  school: {
    type: Schema.Types.ObjectId,
    ref: 'Schools',
  },
  currentTerm: {
    type: Number,
    default: 0,
  },
  courseMap: {
    0: {
      type: Number,
    },
    1: {
      type: Number,
    },
    2: {
      type: Number,
    },
    3: {
      type: Number,
    },
    4: {
      type: Number,
    },
    5: {
      type: Number,
    },
    6: {
      type: Number,
    },
    7: {
      type: Number,
    },
  },
  // cookie: { type: String },
}, {
  timestamps: true,
})

module.exports = mongoose.model('Students', StudentSchema)
