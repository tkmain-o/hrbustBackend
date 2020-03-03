// const xlsx = require('node-xlsx')
const charset = require('superagent-charset')
const superagent = charset(require('superagent'))
// const path = require('path')
const md5 = require('md5')
// const cetData = require('./util/getTestData').cetData;

// const excelName = '2019_1.xls'
// const list = xlsx.parse(path.resolve(`./utils/${excelName}`))
// const data = list[0].data
// const len = data.length - 1
// function check (user) {
//   let id = ''
//   let name = ''
//   for (let i = 1; i < len; i += 1) {
//     if (data[i][3] === user) {
//       id = data[i][0]
//       name = data[i][1]
//       break
//     }
//   }
//   return {
//     id,
//     name,
//   }
// }

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

const getCetCaptcha = (url) => {
  const urlt = url || 'http://www.chsi.com.cn/cet/ValidatorIMG.JPG'
  return new Promise((resolve) => {
    superagent
      .get(urlt)
      .end((err, response) => {
        // console.log(response)
        let cookie
        try {
          cookie = response && response.headers['set-cookie']
        } catch (error) {
          console.log(error)
        }
        // console.log(response.body);
        const buffer = Buffer.from(response.body, 'base64')
        resolve({
          base64: buffer.toString('base64'),
          cookie,
        })
      })
  })
}

function handleToken (cookie) {
  let cookies = {}

  cookie.forEach(value => {
    let cookieInfos = value.split('=')
    cookies[cookieInfos[0]] = cookieInfos[1]
  })

  return md5(`${decodeURIComponent(cookies.hwJR_2132_token)}weixiao`)
}

const getToken = () => {
  return new Promise((resolve) => {
    superagent
      .get('https://weixiao.qq.com/apps/public/cet/index.html')
      .end((err, response) => {
        const cookie = response.headers['set-cookie']
        resolve({ token: handleToken(cookie), tcookie: cookie })
      })
  })
}

const getCet = async ({
  id = '', name = '', yzm = '', cookie = '',
}) => {
  // const promise = new Promise((resolve) => {
  let idt = id
  let namet = name
  // if (username) {
  //   const mes = check(username)
  //   idt = mes.id
  //   namet = mes.name
  // }
  // const param = `zkzh=${idt}&xm=${namet}`
  // const url = `http://www.chsi.com.cn/cet/query?${encodeURI(param)}`
  const {
    token,
    tcookie,
  } = await getToken()
  options.headers.Cookie = tcookie
  const url = `https://www.wexcampus.com/cet/result?token=${token}`
  // console.log(url)
  const sendData = {
    number: idt,
    name: namet,
  }
  if (yzm) {
    sendData.img_code = yzm
    sendData.type = 1
    options.headers.Cookie = cookie
  }
  const resultA = await superagent
    .post(url)
    .set(options.headers)
    .send(sendData)
    .then((response) => {
      const bod = response.text
      const dataP = JSON.parse(bod)
      if (dataP.code === 80001) {
        return getCetCaptcha(dataP.img_url).then(result => {
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
        error: dataP.message,
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
    ...cetData,
  }
}

const getCetCaptchaHandler = async (ctx) => {
  const { id, token, cookie } = ctx.query
  // await getCetCaptcha();
  // const mes = check(username)
  // const id = mes.id
  const url = `https://www.wexcampus.com/cet/change-img?number=${id}&token=${token}`
  options.headers.Cookie = cookie
  const result = await new Promise((resolve) => {
    superagent
      .get(url)
      .set(options.headers)
      .end(async (err, response) => {
        const { base64 } = await getCetCaptcha(response.body.url)
        resolve({
          base64,
        })
      })
  })
  ctx.body = {
    code: 200,
    data: result,
  }
}

module.exports = {
  getCet,
  getCetHandler,
  getCetCaptcha,
  getCetCaptchaHandler,
}
