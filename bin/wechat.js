#!/usr/bin/env node

/**
 * Module dependencies.
 */
const mongoose = require('mongoose')
// const debug = require('debug')('hrbust-backend:server')
const { Wechaty, config } = require('wechaty') // import { Wechaty } from 'wechaty'
const qrTerm = require('qrcode-terminal')
const { FileBox } = require('file-box')
const superagent = require('superagent')
const { mongodb } = require('../utils')
const Students = require('../models/Students')
const Users = require('../models/Users')
const OrderCetStudents = require('../models/OrderCetStudents')
// const schedule = require('node-schedule')
const { apiKey, userId } = require('../config/config').tuling


mongoose.Promise = global.Promise
mongoose
  .connect(mongodb, { useNewUrlParser: true })

const bot = new Wechaty({
  profile: config.default.DEFAULT_PROFILE,
})

/**
 *
 * 4. You are all set. ;-]
 *
 */

/**
 *
 * 5. Define Event Handler Functions for:
 *  `scan`, `login`, `logout`, `error`, and `message`
 *
 */
function onScan (qrcode, status) {
  qrTerm.generate(qrcode, { small: true })

  // Generate a QR Code online via
  // http://goqr.me/api/doc/create-qr-code/
  const qrcodeImageUrl = [
    'https://api.qrserver.com/v1/create-qr-code/?data=',
    encodeURIComponent(qrcode),
  ].join('')

  console.log(`[${status}] ${qrcodeImageUrl}\nScan QR Code above to log in: `)
}

function onLogin (user) {
  console.log(`${user.name()} login`)
  bot.say('Wechaty login').catch(console.error)
  // schedule.scheduleJob('40 50 16 * * 1-5', sendDaily);
}

function onLogout (user) {
  console.log(`${user.name()} logouted`)
}

function onError (e) {
  console.error('Bot error:', e)
  /*
  if (bot.logonoff()) {
    bot.say('Wechaty error: ' + e.message).catch(console.error)
  }
  */
}

/**
 *
 * 6. The most important handler is for:
 *    dealing with Messages.
 *
 */
async function onMessage (msg) {
  console.log(msg.toString())

  if (msg.age() > 60) {
    console.log('Message discarded because its TOO OLD(than 1 minute)')
    return
  }

  if (msg.type() !== bot.Message.Type.Text
      || !/^(ding|ping|bing|code)$/i.test(msg.text())
      /* && !msg.self() */
  ) {
    console.log('Message discarded because it does not match ding/ping/bing/code')
    return
  }

  /**
   * 1. reply 'dong'
   */
  await msg.say('dong')
  console.log('REPLY: dong')

  /**
   * 2. reply image(qrcode image)
   */
  const fileBox = FileBox.fromUrl('https://chatie.io/wechaty/images/bot-qr-code.png')

  await msg.say(fileBox)
  console.log('REPLY: %s', fileBox.toString())

  /**
   * 3. reply 'scan now!'
   */
  await msg.say([
    'Join Wechaty Developers Community\n\n',
    'Scan now, because other Wechaty developers want to talk with you too!\n\n',
    '(secret code: wechaty)',
  ].join(''))
}

/**
 *
 * 7. Output the Welcome Message
 *
 */
const welcome = `
| __        __        _           _
| \\ \\      / /__  ___| |__   __ _| |_ _   _
|  \\ \\ /\\ / / _ \\/ __| '_ \\ / _\` | __| | | |
|   \\ V  V /  __/ (__| | | | (_| | |_| |_| |
|    \\_/\\_/ \\___|\\___|_| |_|\\__,_|\\__|\\__, |
|                                     |___/
=============== Powered by Wechaty ===============
-------- https://github.com/chatie/wechaty --------
          Version: ${bot.version(true)}
I'm a bot, my superpower is talk in Wechat.
If you send me a 'ding', I will reply you a 'dong'!
__________________________________________________
Hope you like it, and you are very welcome to
upgrade me to more superpowers!
Please wait... I'm trying to login in...
`
console.log(welcome)


/**
 *
 * 2. Register event handlers for Bot
 *
 */
bot
  .on('logout', onLogout)
  .on('login', onLogin)
  .on('scan', onScan)
  .on('error', onError)
  .on('message', onMessage)

/**
 *
 * 3. Start the bot!
 *
 */
bot.start()
  .catch(async e => {
    console.error('Bot start() fail:', e)
    await bot.stop()
    process.exit(-1)
  })


bot.on('message', async (msg) => {
  const contact = msg.from()
  const text = msg.text()
  const room = msg.room()

  if (msg.self()) {
    return
  }

  if (room) {
    // console.log(room.payload.topic, room.payload.memberIdList, 'room')
    // const topic = await room.topic()
    // console.log(`Room: ${topic} Contact: ${contact.name()} Text: ${text}`)
    // const roomList = ['云图test', '我有一个大胆的想法🙈']
    // if (room.payload.topic) {

    // }
    if (/@Robot/.test(text)) {
      // let room = await bot.Room.find({ topic: '云图test' })
      let memberList = await room.memberList()
      memberList = memberList.filter(item => item !== contact)
      // console.log(memberList, 'room memberList')
      if (/数据/.test(text)) {
        const c1 = await Students.find({}).count()
        const c2 = await Users.find({}).count()
        const c3 = await OrderCetStudents.find({}).count()
        await room.say(`
🥇 微信用户总数：${c2}
🥈 登录教务在线人总数：${c1}
🥉 预约四六级人总数：${c3}
预约四六级人日活数：去你妈的统计不出来
登录教务在线日活数：去你妈的统计不出来
预约四六级人日活数：去你妈的统计不出来`, contact)
        // await room.del(contact)
      } if (/取餐|傻逼/.test(text)) {
        const rand = parseInt(Math.random() * memberList.length)
        // console.log(memberList, rand)
        // const user = await bot.Contact.find({ id: memberList[rand] })
        // console.log(user, user)
        await room.say(`你${/取餐/.test(text) ? '取餐' : '傻逼'}`, memberList[rand])
      } else if (/^谁/.test(text)) {
        const rand = parseInt(Math.random() * memberList.length)
        // console.log(memberList, rand)
        // const user = await bot.Contact.find({ id: memberList[rand] })
        // console.log(user, user)
        await room.say(`你${text.slice(1)}`, memberList[rand])
      } else {
        const a = text.replace('@CTO', '')
        const res = await superagent
          .post('http://openapi.tuling123.com/openapi/api/v2')
          .send({
            reqType: 0,
            perception: {
              inputText: {
                text: a,
              },
            },
            userInfo: {
              apiKey,
              userId,
            },
          })

        let textRes = '不知道你在说什么哟'
        try {
          textRes = JSON.parse(res.text).results[0].values.text
        } catch (error) {
          textRes = '不知道你在说什么哟'
        }
        // console.log(res.text)
        // const text = res.text
        await room.say(textRes)
      }

      // if (room) {
      //   await room.say('You said fword, I will remove from the room', contact)
      //   const c1 = await Students.find({}).count()
      //   const c2 = await Users.find({}).count()
      //   const c3 = await OrderCetStudents.find({}).count()
      //   await room.say(`实时 微信用户数：${c2};登录教务在线人数：${c1};预约四六级人数：${c3}`, contact)
      //   // await room.del(contact)
      // }
    }
  } else {
    console.log(`Contact: ${contact.name()} Text: ${text}`)
  }

  // if (/Hello/.test(text)) {
  //   msg.say('Welcome to wechaty, I am wechaty bot RUI!')
  // }

  // if (/room/.test(text)) {
  //   const room = await bot.Room.find({ topic: 'wechaty test room' })

  //   if (room) {
  //     const topic = await room.topic()
  //     await room.add(contact)
  //     await room.say(`Welcome to join ${topic}`, contact)
  //   }
  // }

  // if (/fword/.test(text)) {
  //   let room = await bot.Room.find({ topic: 'wechaty test room' })

  //   if (room) {
  //     await room.say('You said fword, I will remove from the room', contact)
  //     await room.del(contact)
  //   }
  // }
  // if (/@CTO/.test(text)) {
  //   let room = await bot.Room.find({ topic: '云图test' })

  //   if (room) {
  //     await room.say('You said fword, I will remove from the room', contact)
  //     const c1 = await Students.find({}).count()
  //     const c2 = await Users.find({}).count()
  //     const c3 = await OrderCetStudents.find({}).count()
  //     await room.say(`实时 微信用户数：${c2};登录教务在线人数：${c1};预约四六级人数：${c3}`, contact)
  //     // await room.del(contact)
  //   }
  // }
})
