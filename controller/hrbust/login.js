const superagent = require('superagent')
const cheerio = require('cheerio')
const Students = require('../../models/Students')
const Users = require('../../models/Users')
const { requestHeader, url, SimulateLogin } = require('../../utils/hrbust')

// 登录处理函数
const login = async (ctx) => {
  const { username, password, captcha } = ctx.request.query
  if (!captcha) {
    ctx.throw(400, '请输入验证码')
  }
  if (!username || !password) ctx.throw(400, '请求参数错误，登录需要用户名和密码')
  const { hrbustCookie, openid } = ctx.session

  try {
    const Login = new SimulateLogin({
      username,
      password,
      simulateIp: ctx.ip,
      cookie: hrbustCookie,
      captcha,
      autoCaptcha: false,
    })
    const result = await Login.login()
    const { name } = Login

    // 更新Student数据库
    const student = await Students.findOneAndUpdate({
      username,
    }, {
      username,
      password,
      name,
    }, {
      upsert: true,
      returnNewDocument: true,
    })

    // 同步更新User数据库，关联student
    await Users.findOneAndUpdate({
      openid,
    }, {
      student,
    })

    // console.log(result)
    ctx.session.username = Login.username
    ctx.session.hrbustCookie = result.cookie
    ctx.body = {
      data: result,
      status: 200,
      message: '登录成功',
    }
  } catch (e) {
    if (e.code) {
      ctx.throw(400, e.message)
    } else {
      ctx.throw(e)
    }
  }
}

const getCaptcha = async (ctx) => {
  try {
    const Login = new SimulateLogin()
    const captcha = await Login.getCaptcha()
    ctx.session.hrbustCookie = Login.cookie
    ctx.body = {
      status: 200,
      message: '获取验证码成功',
      data: {
        captcha,
      },
    }
  } catch (e) {
    if (e.code) {
      ctx.throw(400, e.message)
    } else {
      ctx.throw(e)
    }
  }
}

// 获取当前周数，（应该存在redis中缓存，本期不做）
const getWeek = (ctx) => {
  let username = ctx.session.username

  if (!username) {
    ctx.throw(401, '未登陆')
  }
  const grade = parseInt(username.toString().substr(0, 2))

  return superagent
    .get(url.indexListLeft)
    .charset()
    .set(requestHeader)
    .then((response) => {
      const body = response.text
      const $ = cheerio.load(body)
      const result = $('#date span').text()
      const thisWeek = result.replace(/\s/g, '')
      const week = (thisWeek && thisWeek.match(/第(\w*)周/) && thisWeek.match(/第(\w*)周/)[1]) ? parseInt(thisWeek.match(/第(\w*)周/)[1]) : 1
      const terms = thisWeek.match(/(\w*)(秋|春)/)
      const year = parseInt(terms[1]) - 1980
      const termsObj = {
        春: 1,
        秋: 0,
      }
      const term = (year - 20 - grade) * 2 + termsObj[terms[2]]
      ctx.body = {
        data: {
          term,
          week,
        },
        status: 200,
      }
    })
    .catch(e => ctx.throw(400, e))
}

// 登录处理函数
const logout = async (ctx) => {
  const { openid } = ctx.session
  await Users.findOneAndUpdate({
    openid,
  }, {
    student: null,
  })
  ctx.session = null
  ctx.body = {
    status: 200,
    message: '解绑成功',
  }
}

module.exports = {
  login,
  logout,
  getCaptcha,
  getWeek,
}
