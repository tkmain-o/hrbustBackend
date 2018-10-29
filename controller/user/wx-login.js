const request = require('request')
const Users = require('../../models/Users')
const Students = require('../../models/Students')
const { AppID, AppSecret } = require('../../config/config')
const WXBizDataCrypt = require('../../utils/WXBizDataCrypt')

// 获取微信鉴权
const getWxAuthorization = (code) => {
  return new Promise((resolve, reject) => {
    request(`https://api.weixin.qq.com/sns/jscode2session?appid=${AppID}&secret=${AppSecret}&js_code=${code}&grant_type=authorization_code`, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const data = JSON.parse(body)
        if (data.errcode) {
          reject(new Error(data.errmsg))
          return
        }
        resolve(data)
      } else {
        reject(new Error(error))
      }
    })
  })
}

const wxLogin = async (ctx) => {
  const { code } = ctx.request.query
  if (!code) ctx.throw(401, 'no jscode')
  try {
    // 微信鉴权
    const data = await getWxAuthorization(code)
    // 更新数据库用户信息
    await Users.findOneAndUpdate({ openid: data.openid }, data, {
      upsert: true,
    })

    const user = await Users.findOne({
      openid: data.openid,
    }).populate({ path: 'student' })
    const student = user.student
    if (student) {
      ctx.session.username = student.username
    }

    // 更新 session
    ctx.session.session_key = data.session_key
    ctx.session.openid = data.openid
    ctx.body = {
      status: 200,
      message: 'ok',
    }
  } catch (e) {
    ctx.throw(400, e)
  }
}

// 更新用户信息：头像、名字等
const updateUserInfo = async (ctx) => {
  const { userInfo } = ctx.request.body
  const data = JSON.parse(userInfo)
  const { openid, session_key } = ctx.session
  const iv = data.iv

  const pc = new WXBizDataCrypt(AppID, session_key)
  const wxData = pc.decryptData(data.encryptedData, iv)
  // console.log('解密后 data: ', d)
  if (wxData.openId !== openid) {
    ctx.throw(400, '非当前账号，更新用户信息失败')
  }

  try {
    // 更新用户信息
    // await Users.findByOpenIdAndUpdateUserInfo({
    //   openid,
    //   session_key,
    //   userInfo: wxData,
    // })
    await Users.findOneAndUpdate({
      openid,
    }, {
      openid,
      session_key,
      userInfo: wxData,
    }, {
      upsert: true,
    })
    ctx.body = {
      status: 200,
      message: 'ok',
    }
  } catch (e) {
    ctx.throw(400, e)
  }
}

// 获取用户信息
const getUserInfo = async (ctx) => {
  const { openid, session_key, username } = ctx.session
  if (!(openid && session_key)) {
    ctx.body = {
      data: {
        isLogin: false,
      },
      status: 200,
    }
    return
  }
  let studentInfo = {
    username,
  }
  if (!username) {
    const user = await Users.findOne({
      openid,
    }).populate({ path: 'student' })
    const student = user.student
    if (student) {
      ctx.session.username = student.username
      studentInfo = {
        username: student.username,
        name: student.name,
      }
    }
  } else {
    const student = await Students.findOne({
      username,
    })
    if (student) {
      studentInfo.name = student.name
    }
    // console.log(student, student.name)
  }
  ctx.body = {
    data: {
      isLogin: !!(ctx.session.openid && ctx.session.session_key),
      studentInfo,
    },
    status: 200,
  }
}

module.exports = {
  wxLogin,
  updateUserInfo,
  getUserInfo,
}
