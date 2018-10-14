/*
  学生各个学期课程信息
*/

const mongoose = require('mongoose')

const TermCourse = new mongoose.Schema({
  id: {
    type: Number, unique: true, required: true, index: true,
  },
  course: {
    type: Array,
  },
}, {
  timestamps: true,
})

module.exports = mongoose.model('TermCourse', TermCourse)
