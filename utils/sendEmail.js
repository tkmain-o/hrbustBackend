/*
 * 发送邮件服务
*/

const nodeMailer = require('nodemailer')

const SMTP_CONF = {
  host: 'smtp.exmail.qq.com',
  port: 465,
  user: 'lgm-smtp@smackgg.cn',
  pwd: 'liGongmiao2019'
}


async function sendMail (fromName, to, subject = '', html = '') {
  const transporter = nodeMailer.createTransport({
    host: SMTP_CONF.host,
    port: SMTP_CONF.port,
    secure: true,
    auth: {
      user: SMTP_CONF.user,
      pass: SMTP_CONF.pwd
    }
  })

  const mailOptions = {
    from: `${fromName} <${SMTP_CONF.user}>`,
    to,
    subject,
    html
  }

  transporter.sendMail(mailOptions, error => {
    if (error) {
      throw new Error('邮件发送失败！！', mailOptions)
    } else {
      console.log('邮件发送成功！')
    }
  })
}

module.exports = {
  sendMail
}
