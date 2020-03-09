const charset = require('superagent-charset')
const superagent = charset(require('superagent'))

const md5 = require('md5')

const getRandomIp = () => {
  const arr = []
  for (let i = 0; i < 4; i += 1) {
    arr.push(Math.floor(Math.random() * 255))
  }
  return arr.join('.')
}
const options = {
  encoding: 'utf8',
  headers: {
    Origin: 'https://weixiao.qq.com',
    Host: 'weixiao.qq.com',
    'Content-Type': 'application/x-www-form-urlencoded',
    Referer: 'https://weixiao.qq.com/apps/public/cet/index.html?from=singlemessage&isappinstalled=0',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.75 Safari/537.36',
    // 客户端的 IP 地址
    'X-Forwarded-For': `${getRandomIp()}`,
  },
}

const getToken = (cookie = '') => {
  const cookies = {}

  cookie.split('; ').forEach((value) => {
    const cookieInfos = value.split('=')
    cookies[cookieInfos[0]] = cookieInfos[1]
  })

  return md5(decodeURIComponent(cookies.hwJR_2132_token) + 'weixiao')
}

const getCetCaptcha = (url, cookie, tokenCookie) => {
  const headers = {
    ...options.headers,
  }
  if (cookie) {
    headers.Cookie = cookie
  }
  const urlt = url || 'http://www.chsi.com.cn/cet/ValidatorIMG.JPG'
  return new Promise((resolve) => {
    superagent
      .get(urlt)
      .set(headers)
      .end((err, response) => {
        let cookieR = cookie
        try {
          cookieR = (response && response.headers['set-cookie']) || cookie
        } catch (error) {
          console.log(error)
        }

        const buffer = Buffer.from(response.body, 'base64')
        const token = getToken(tokenCookie)

        resolve({
          base64: `data:image/png;base64, ${buffer.toString('base64')}`,
          cookie: cookieR,
          token,
        })
      })
  })
}

const getCet = async ({
  id = '', name = '', yzm = '', cookie = '',
}) => {
  let idt = id
  let namet = name
  const tokenCookie = `name=${encodeURIComponent(name)}; number=${id}`

  const url = `https://www.wexcampus.com/cet/result?token=${getToken(tokenCookie)}`

  const sendData = {
    number: idt,
    name: namet,
  }

  if (yzm) {
    sendData.img_code = yzm
    sendData.type = 1
  }

  const resultA = await superagent
    .post(url)
    .set({
      ...options.headers,
      Cookie: yzm ? cookie : '',
    })
    .send(sendData)
    .then((response) => {
      const bod = response.text
      const dataP = JSON.parse(bod)

      if (dataP.code === 80001) {
        return getCetCaptcha(dataP.img_url, cookie, tokenCookie).then(result => {
          return Promise.resolve({
            code: 80001,
            base64: result.base64,
            cookie: result.cookie,
            token: result.token,
          })
        })
      } if (dataP.code === 0) {
        return Promise.resolve({
          data: {
            name: namet,
            school: dataP.result.school,
            type: `大学英语${dataP.result.number.substr(9, 1) === '1' ? '四' : '六'}级考试`,
            id: idt,
            total: dataP.result.total === '.00' ? 0 : dataP.result.total,
            listen: dataP.result.hearing,
            reading: dataP.result.reading,
            writing: dataP.result.writing,
          },
        })
      }
      return Promise.resolve({
        code: 400,
        message: dataP.message,
      })
    })
  return resultA
}

const getCetHandler = async (ctx) => {
  const {
    id,
    name,
    username,
    yzm,
    cookie,
  } = ctx.query

  const cetData = await getCet({
    id,
    name,
    username,
    yzm,
    cookie,
  })

  ctx.body = {
    code: cetData.code || 200,
    ...cetData,
  }
}

// const getCetCaptchaHandler = async (ctx) => {
//   const { id, token, cookie } = ctx.query
//   // await getCetCaptcha();
//   // const mes = check(username)
//   // const id = mes.id
//   const url = `https://www.wexcampus.com/cet/change-img?number=${id}&token=${token}`
//   options.headers.Cookie = cookie
//   const result = await new Promise((resolve) => {
//     superagent
//       .get(url)
//       .set(options.headers)
//       .end(async (err, response) => {
//         const { base64 } = await getCetCaptcha(response.body.url)
//         resolve({
//           base64,
//         })
//       })
//   })
//   ctx.body = {
//     code: 200,
//     data: result,
//   }
// }

module.exports = {
  getCet,
  getCetHandler,
  // getCetCaptcha,
  // getCetCaptchaHandler,
}
