/*
  首页Banner
*/

const mongoose = require('mongoose')

const CourseSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  locale: { type: String, required: true },
  teacher: { type: String, required: true },
  messege: { type: String, default: '讲课学时' },
  sectionstart: { type: Number, required: true },
  sectionend: { type: Number, required: true },
  day: { type: Number, required: true },
  courseId: { type: String, required: true },
  period: { type: Object, required: true },
  week: { type: String, required: true },
}, {
  timestamps: true,
})

module.exports = mongoose.model('Course', CourseSchema)
