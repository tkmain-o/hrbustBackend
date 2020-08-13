const superagent = require('superagent')
const cheerio = require('cheerio')
const qs = require('qs')

const {
  strEnc,
  // strDec,
} = require('../../utils/des')
// console.log(strDec('ED33BF9D1A8EEB4C88889A3665A3E46D63F98CF8CB60CD0BF3138A7ACF75663502CC944A8BB4044D3F87C346C8672F7C22A15E497B252535CB40223BE65B37B8916B484A3B089D632BB164BFC47C713AF98384F6A3C59479526AE3C78A4EDC3CD30EA8C67CE2667CBAA237F7A7632AD7E5E73B633683C8577FC545B38D6F1738B2DA8880EA270330', '1', '2', '3'))
const requestHeader = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
  Referer: 'http://yingxin.hrbust.edu.cn/tpass/login?service=http%3A%2F%2Fyingxin.hrbust.edu.cn%2Ftp_hp%2F',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36',
}
// 274018
// 获取成绩
const getYingxin = async (ctx) => {
  const { id, password } = ctx.query

  // 获取首次 cookie
  const getCookieRes = await superagent
    .get('http://yingxin.hrbust.edu.cn/tpass/login?service=http%3A%2F%2Fyingxin.hrbust.edu.cn%2Ftp_hp%2F')
    .set(requestHeader)

  const cookie = getCookieRes.headers['set-cookie'][1].split(';')[0]
  const body = getCookieRes.text
  const $ = cheerio.load(body)
  const lt = $('#lt').val()
  const execution = $('input[name=execution]').val()
  // console.log(lt, execution, cookie)
  // 加密算法
  const rsa = strEnc(id + password + lt, '1', '2', '3')

  // 拼接 formdata
  const formData = qs.stringify({
    rsa,
    ul: 14,
    pl: 6,
    lt,
    execution,
    _eventId: 'submit',
  })

  // 模拟登录
  await superagent
    .post('http://yingxin.hrbust.edu.cn/tpass/login?service=http%3A%2F%2Fyingxin.hrbust.edu.cn%2Ftp_hp%2F')
    // .charset()
    .set({
      ...requestHeader,
      'Content-Type': 'application/x-www-form-urlencoded',
      Referer: 'http://yingxin.hrbust.edu.cn/tpass/login?service=http%3A%2F%2Fyingxin.hrbust.edu.cn%2Ftp_hp%2F',
      Cookie: cookie,
    })
    // .redirects(0)
    .send(formData)

  // 获取数据
  const response = await superagent
    .post('http://yingxin.hrbust.edu.cn/tp_hp/hp/StudentInformat/getStudentInformat')
    .set({ Cookie: cookie })
    .send({})

  ctx.body = {
    data: response.body,
    status: 200,
  }
}

module.exports = {
  getYingxin,
}
