/**
  验证码识别，结合python服务
  @param {string} filePath 验证码图片地址
*/

const xml2json = require('node-xml2json')
const request = require('request')

function discernCaptcha (filePath) {
  const promise = new Promise((resolve, reject) => {
    request(`http://localhost:8007/?name=${filePath}`, (error, response, body) => {
      let errors = error
      let text = ''
      let predictable = 'False'
      try {
        const bodyObj = xml2json.parser(body)
        text = bodyObj.note.digits
        predictable = bodyObj.note.predictable
      } catch (e) {
        errors = e
      }
      if (errors) {
        return reject(errors)
      }
      return resolve({
        text,
        predictable,
      })
      // resolve({
      //   error: '抱歉，由于请求量过大，验证码识别失败导致登陆失败（这个问题正在抓紧解决~~~），请您稍后重试。',
      // });
    })
    // const formData = {
    //   file: fs.createReadStream(filePath),
    // };

    // request.post({
    //   url: `http://lab.ocrking.com/ok.html?service=OcrKingForPhoneNumber&language=eng&charset=11&apiKey=${spiKeys[count]}&type=http://t.51chuli.com/contact/d827323fa035a7729w060771msa9211z.gif`,
    //   formData,
    // }, (err, httpResponse, body) => {
    //   let bodyObj = {};
    //   console.log(body)
    //   try {
    //     bodyObj = xml2json.parser(body).results.resultlist;
    //   } catch (e) {
    //     console.error(e);
    //   }
    //
    //   if ((bodyObj.item && !bodyObj.item.status) || err || httpResponse.statusCode !== 200) {
    //     // 验证码识别网站失效
    // resolve({
    //   error: '抱歉，由于请求量过大，验证码识别失败导致登陆失败（这个问题正在抓紧解决~~~），请您稍后重试。',
    // });
    //     return;
    //   }
    //   resolve(bodyObj);
    // });
  })
  return promise
}

module.exports = discernCaptcha
