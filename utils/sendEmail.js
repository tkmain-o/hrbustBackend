/*
 * 发送邮件服务
*/

const nodeMailer = require('nodemailer')
const smtpConf = require('../config/smtpConf')

async function sendMail (fromName, to, subject = '', html = '') {
  const transporter = nodeMailer.createTransport({
    host: smtpConf.host,
    port: smtpConf.port,
    secure: true,
    auth: {
      user: smtpConf.user,
      pass: smtpConf.pwd,
    },
  })

  const mailOptions = {
    from: `${fromName} <${smtpConf.user}>`,
    to,
    subject,
    html,
  }
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, error => {
      if (error) {
        // throw new Error('邮件发送失败！！', mailOptions)
        console.error('邮件发送失败！！', mailOptions, error)
        reject(new Error('邮件发送失败！！', mailOptions))
      } else {
        console.log('邮件发送成功！')
        resolve()
      }
    })
  })
}

module.exports = {
  sendMail,
}
