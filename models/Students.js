/*
  学生信息
*/

const mongoose = require('mongoose')

const Schema = mongoose.Schema
const StudentSchema = new mongoose.Schema({
  username: {
    type: String, unique: true, required: true, index: true,
  },
  password: {
    type: String, required: true,
  },
  count: {
    type: Number, default: 1,
  },
  name: {
    type: String, required: true,
  },
  school: {
    type: Schema.Types.ObjectId, ref: 'Schools',
  },
  // 当前年级，之前使用username的前两位作为年级，但遇到降级的同学就会出现问题
  // 此字段是课表页爬到的准确年级
  grade: {
    type: Number, default: 0,
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
    8: {
      type: Number,
    },
    9: {
      type: Number,
    },
  },
}, {
  timestamps: true,
})

module.exports = mongoose.model('Students', StudentSchema)
