/*
  首页Banner
*/

const mongoose = require('mongoose')

const CetTicketSchema = new mongoose.Schema({
  uuid: { type: String, required: true },
  ticket: { type: String, required: true },
  subjectName: { type: String, required: true },
  name: { type: String, required: true },
  id: { type: String, required: true },
}, {
  timestamps: true,
})

module.exports = mongoose.model('CetTicket', CetTicketSchema)
