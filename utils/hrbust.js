const cheerio = require('cheerio')
const charset = require('superagent-charset')
const superagent = charset(require('superagent'))
const moment = require('moment')
const Students = require('../models/Students')
const Users = require('../models/Users')
// const fs = require('fs')
// const path = require('path')

moment.locale('zh-cn')

// 请求头
const requestHeader = {
  'Accept-Encoding': 'gzip, deflate',
  Origin: 'http://jwzx.hrbust.edu.cn',
  'Content-Type': 'application/x-www-form-urlencoded',
}
// const getCaptcha = require('./captcha.js')
// const mongoUtils = require('../../spider/mongoUtils')

// 爬虫 url
const url = {
  login_url: 'http://jwzx.hrbust.edu.cn/academic/common/security/login.jsp',
  captcha_url: 'http://jwzx.hrbust.edu.cn/academic/getCaptcha.do',
  check_url: 'http://jwzx.hrbust.edu.cn/academic/j_acegi_security_check?',
  index: 'http://jwzx.hrbust.edu.cn/academic/index.jsp',
  indexHeader: 'http://jwzx.hrbust.edu.cn/academic/showHeader.do',
  indexListLeft: 'http://jwzx.hrbust.edu.cn/academic/listLeft.do',
  index_new: 'http://jwzx.hrbust.edu.cn/academic/index_new.jsp',
  studentId: 'http://jwzx.hrbust.edu.cn/academic/student/currcourse/currcourse.jsdo?groupId=&moduleId=2000',
  loginError: 'http://jwzx.hrbust.edu.cn/academic/common/security/login.jsp?login_error=1',
}

/**
 * new SimulateLogin(arguments)
 * SimulateLogin return a cookie
 * @param {object}
   * @param {string} username   用户名
   * @param {string} password   密码
   * @param {string} cookie     理工的cookie信息
   * @param {string} simulateIp
   * @param {string} captcha
 */

class SimulateLogin {
  constructor (option = {}) {
    const {
      autoCaptcha = false,
      username,
      password,
      simulateIp,
      cookie = '',
      captcha = '',
      openid = '',
    } = option
    this.autoCaptcha = autoCaptcha
    this.username = username
    this.password = password
    this.captcha = captcha
    this.cookie = cookie
    this.openid = openid
    if (simulateIp) {
      requestHeader['X-Forwarded-For'] = simulateIp
    }
  }

  async login () {
    const data = await this.checkCookie()

    // cookie 合法 不需要登录
    if (data.isValidCookie) {
      return {
        cookie: this.cookie,
        ...data,
      }
    }

    // 输入验证码登录
    if (!this.autoCaptcha) {
      return this.loginHandler()
    }
    // 自动校验验证码逻辑
    return {}
    // 返回异步回调
    // return new Promise(resolve => {
    //   this.callback = resolve
    //   // 检查cookie有效性
    //   checkCookie(this.cookie).then(data => {
    //     this.term = data.term
    //     this.year = data.year
    //     this.week = data.week
    //
    //     if (data.isValidCookie) {
    //       // 如果 cookie 合法，直接返回cookie以及学期等信息
    //       this.callback({
    //         cookie: this.cookie,
    //         ...data,
    //       })
    //     } else {
    //       // 不合法获取验证码
    //       this.cookie = ''
    //       this.getCookie()
    //     }
    //   })
    // })
  }

  // 异步获取验证码
  async getCaptcha () {
    await this.getCookie()
    const buffer = await this.getCaptchaBuffer()
    // base 拼接
    return `data:image/png;base64, ${buffer.toString('base64')}`
  }

  // 检查是否登录，并返回当前学期、周数
  checkCookie () {
    return new Promise(resolve => {
      superagent
        .get(url.indexListLeft)
        .charset()
        .set(requestHeader)
        .set('Cookie', this.cookie)
        .redirects(0)
        .end((err, response) => {
          if (err) {
            console.error('get index is error')
            resolve({
              isValidCookie: false,
            })
          } else {
            const body = response.text
            const $ = cheerio.load(body)
            const result = $('#date span').text()
            const thisWeek = result.replace(/\s/g, '')
            this.week = thisWeek.match(/第(\w*)周/)[1] ? parseInt(thisWeek.match(/第(\w*)周/)[1]) : 1
            const terms = thisWeek.match(/(\w*)(秋|春)/)
            this.year = parseInt(terms[1]) - 1980
            const termsObj = {
              春: 1,
              秋: 2,
            }
            this.term = termsObj[terms[2]]
            // 如果 lenght是0 证明未登陆 cookie 失效
            const flag = $('#menu li').length === 0
            resolve({
              isValidCookie: !flag,
            })
          }
        })
    })
  }

  // 获取 cookie
  getCookie () {
    return superagent
      .post(url.login_url)
      .set(requestHeader)
      .redirects(0)
      .then((res) => {
        this.cookie = res.headers['set-cookie'][0].split(';')[0]
        return Promise.resolve(this.cookie)
      })
      .catch(error => {
        return Promise.reject(new Error(error))
      })
      // .end((error, response) => {
      //   if (error) {
      //     this.callback({ error })
      //   }
      //   this.cookie = response.headers['set-cookie'][0].split(';')[0]
      //   // console.warn(this.cookie)
      //   // if (!this.autoCaptcha) {
      //   //   // this.getCaptchaBuffer().then((buffer) => {
      //   //   //   this.callback = resolve
      //   //   // })
      //   //   return
      //   // }
      //   // this.handlerCaptcha().then((captchaText) => {
      //   //   if (captchaText.error) {
      //   //     this.callback({
      //   //       error: captchaText.error,
      //   //     })
      //   //     return
      //   //   }
      //   //   this.loginHandler(captchaText)
      //   // })
      // })
  }

  // 获取验证码
  getCaptchaBuffer () {
    return superagent
      .get(url.captcha_url)
      .buffer(true)
      .set(requestHeader)
      .set('Cookie', this.cookie)
      .then(response => {
        const dataBuffer = Buffer.from(response.body, 'base64')
        return Promise.resolve(dataBuffer)
      })
      .catch(error => {
        Promise.reject(new Error(error))
      })
  }

  // captcha (callback) {
  //   return this.getCaptchaBuffer().then((dataBuffer) => {
  //     const captchaPath = path.resolve(__dirname, `../../cacheImages/${captchaCount}.jpg`)
  //     console.warn(`captchaCount: ${captchaCount}`)
  //     captchaCount += 1
  //     fs.writeFile(captchaPath, dataBuffer, (err) => {
  //       if (err) throw err
  //       getCaptcha(captchaPath).then((result) => {
  //         fs.unlinkSync(captchaPath)
  //
  //         // 解析验证码出错，重新验证
  //         if (result.error || !result.text || result.predictable === 'False') {
  //           this.captcha(callback)
  //           return
  //         }
  //         let text = ''
  //         text = result && result.text ? result.text : ''
  //         callback(text)
  //       }).catch(() => {
  //         // 解析验证码出错，重新验证
  //         this.captcha(callback)
  //       })
  //     })
  //   })
  // }

  handlerCaptcha () {
    return new Promise((resolve) => {
      this.captcha((text) => {
        resolve(text)
      })
    })
  }

  loginHandler () {
    // 登录处理
    return superagent
      .post(url.check_url)
      .send({
        j_username: this.username,
        j_password: this.password,
        j_captcha: this.captcha,
      })
      .set(requestHeader)
      .set('Cookie', this.cookie)
      .redirects(0)
      .catch((e) => {
        const location = e.response.headers.location
        if (location === url.index || location === url.index_new) {
          console.warn('login good')
          this.cookie = e.response.headers['set-cookie'][0].split(';')[0]

          // 更新数据库
          this.updateDB()
          return Promise.resolve({
            cookie: this.cookie,
            term: this.term,
            year: this.year,
            week: this.week,
          })
          // save student infomation to mongo
          // this.updateMongo()
        }
        return this.errorHandler()
      })
  }

  // 登录成功更新数据库信息
  updateDB () {
    return superagent
      .get(url.indexHeader)
      .charset()
      .set(requestHeader)
      .set('Cookie', this.cookie)
      .then(async (response) => {
        const body = response.text
        const $ = cheerio.load(body)
        const name = $('#greeting span').text().split('(')[0]

        // 更新Student数据库
        const student = await Students.findOneAndUpdate({
          username: this.username,
        }, {
          username: this.username,
          password: this.password,
          name,
        }, {
          upsert: true,
          returnNewDocument: true,
        })

        // 同步更新User数据库，关联student
        if (this.openid) {
          await Users.findOneAndUpdate({
            openid: this.openid,
          }, {
            student,
          })
        }
      })
  }

  // 登录错误处理
  errorHandler () {
    const promise = new Promise((resove, reject) => {
      superagent
        .get(url.loginError)
        .charset()
        .set(requestHeader)
        .set('Cookie', this.cookie)
        .end((error, response) => {
          if (error) {
            return reject(new Error(error))
          }
          const body = response.text
          const $ = cheerio.load(body)
          const errorText = $('#message').text().replace(/\s/g, '')
          // resolve(errorText)
          return reject(new Error(errorText))
        })
    })
    return promise
  }
}

// 所有哈理工教务处需要登录的接口，都需要此函数校验是否登录，
// 若未登录返回验证码，并设置新cookie到session种
const checkLoginStatus = async (ctx) => {
  const cookie = ctx.session.hrbustCookie
  const Login = new SimulateLogin({
    cookie,
  })
  const { isValidCookie } = await Login.checkCookie()

  if (!isValidCookie) {
    // 如果cookie失效，返回验证码s
    const captcha = await Login.getCaptcha()
    ctx.session.hrbustCookie = Login.cookie
    ctx.body = {
      status: 401,
      message: '登录已失效',
      data: {
        captcha,
      },
    }
    return false
  }
  return true
}

module.exports = {
  url,
  requestHeader,
  SimulateLogin,
  checkLoginStatus,
}
