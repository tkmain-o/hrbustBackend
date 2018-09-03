// const moment = require('moment')
// const getCaptcha = require('./captcha.js')
const request = require('request')
// const User = require('../../models/user')
const { AppID, AppSecret } = require('../../config/config')
// const wechatAuthUrl =

module.exports = function wxLogin (code) {
  request(`https://api.weixin.qq.com/sns/jscode2session?appid=${AppID}&secret=${AppSecret}&js_code=${code}&grant_type=authorization_code`, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      console.error(body) // 请求成功的处理逻辑
    }
  })
}
