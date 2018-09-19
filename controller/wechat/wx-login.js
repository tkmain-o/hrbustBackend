const request = require('request')
const User = require('../../models/user')
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
    const user = await User.findByOpenIdAndUpdateUserInfo(data)
    // 更新 session
    ctx.session.session_key = user.session_key
    ctx.session.openid = user.openid
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
    await User.findByOpenIdAndUpdateUserInfo({
      openid,
      session_key,
      userInfo: wxData,
    })
    ctx.body = {
      status: 200,
      message: 'ok',
    }
  } catch (e) {
    ctx.throw(400, e)
  }
}

const checkLogin = (ctx) => {
  ctx.body = {
    data: {
      isLogin: !!(ctx.session.openid && ctx.session.session_key),
    },
    status: 200,
  }
}

module.exports = {
  wxLogin,
  updateUserInfo,
  checkLogin,
}