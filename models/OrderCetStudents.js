/*
  预定CET查询的学生信息
*/

const mongoose = require('mongoose')

const OrderCetStudentsSchema = new mongoose.Schema({
  openid: {
    type: String, required: true,
  },
  username: {
    type: String, unique: true, required: true, index: true,
  },
  name: {
    type: String, required: true,
  },
  ticketNumber: {
    type: Number, required: true,
  },
  email: {
    type: String, required: true,
  },
  examDate: {
    type: Number, default: 201812,
  },
  grade: {
    type: Object, default: {},
  },
  send: {
    type: Boolean, default: false,
  },
})

module.exports = mongoose.model('OrderCetStudents', OrderCetStudentsSchema)
