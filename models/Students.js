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
  // cookie: { type: String },
}, {
  timestamps: true,
})

class StudentClass {
  static async findAndUpdate (data) {
    // 查找是否有该用户，如果有更新用户信息，如果没有新建
    const { username } = data
    let user = await this.findOne({
      username,
    })
    let result
    if (user) {
      user.set({
        ...data,
      })
      user.update({
        $inc: { count: 1 },
      })
      result = await user.save()
    } else {
      const u = new this({
        ...data,
      })
      result = await u.save()
    }
    return result
  }
}
StudentSchema.loadClass(StudentClass)

module.exports = mongoose.model('Students', StudentSchema)
