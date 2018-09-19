/*
  用户信息
*/

const mongoose = require('mongoose')

const Schema = mongoose.Schema

const UserSchema = new mongoose.Schema({
  openid: {
    type: String,
    required: true,
    unique: true,
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'Students',
  },
  userInfo: {
    nickName: String,
    gender: String,
    language: String,
    city: String,
    province: String,
    country: String,
    avatarUrl: String,
  },
  session_key: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
})

// class UserClass {
//   static async findByOpenIdAndUpdateUserInfo (data) {
//     // 查找是否有该用户，如果有更新用户信息，如果没有新建
//     const { openid } = data
//     let user = await this.findOne({
//       openid,
//     })
//     let result
//     if (user) {
//       user.set({
//         ...data,
//       })
//       result = await user.save()
//     } else {
//       const u = new this({
//         ...data,
//       })
//       result = await u.save()
//     }
//     return result
//   }
// }
// UserSchema.loadClass(UserClass)

const User = mongoose.model('Users', UserSchema)

module.exports = User
