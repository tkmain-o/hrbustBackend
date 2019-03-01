// // const charset = require('superagent-charset')
// const OrderCetStudents = require('../../models/OrderCetStudents')
// const { getCet } = require('../other/cet')
// const { sendMail } = require('../../utils/sendEmail')
// // 3104
// // let count = 0

// OrderCetStudents.find().then((data) => {
//   const plist = data.forEach((item, index) => {
//     // console.log(item.grade)
//     // getCetHandler(item.ticketNumber, item.name, index)
//     // if (index >= 200) {
//     //   return;
//     // }
//     if (index < 2000 || index >= 3000) {
//       return
//     }
//     console.log(index)
//     if (Object.keys(item.grade).length > 0) {
//       const {
//         error,
//         name,
//         school,
//         type,
//         id,
//         total,
//         listen,
//         reading,
//         writing,
//       } = item.grade
//       const emailData = error
//         ? `<p>您的预约信息（姓名：${item.name}, 准考证号: ${item.ticketNumber}）有误，没有查到成绩<p>`
//         : `<h1><p style="color:${total >= 425 ? 'green' : 'red'}">总分：${total}</p></h1>
//         <h2>${type}</h2>
//         <p>学校：${school}</p>
//         <p>姓名：${name}</p>
//         <p>准考证号：${id}</p>
//         <p>总分：${listen}</p>
//         <p>阅读：${reading}</p>
//         <p>写作和翻译：${writing}</p>`
//       sendMail('理工喵', item.email, `${item.name}四六级预约查询结果`, emailData).then(() => {
//         OrderCetStudents.findOneAndUpdate({
//           ticketNumber: id,
//           name: item.name,
//         }, {
//           send: true,
//         })
//       }).catch((error) => {
//         console.log(error)
//       })
//     }
//   })
// })
// // const emailData = grade.error ?
// //     `您的预约信息（姓名：${info.name}, 准考证号: ${info.ticketNumber}）有误，没有查到成绩，`
// //     :

// // OrderCetStudents.findOne({
// //   name: '吕星宇'
// // }).then((item) => {
// //   const {
// //     error,
// //     name,
// //     school,
// //     type,
// //     id,
// //     total,
// //     listen,
// //     reading,
// //     writing,
// //   } = item.grade;
// //   const emailData = error ?
// //     `<p>您的预约信息（姓名：${item.name}, 准考证号: ${item.ticketNumber}）有误，没有查到成绩<p>`
// //     : `<h1><p style="color:${total >= 425 ? 'green' : 'red'}">总分：${total}</p></h1>
// //   <h2>${type}</h2>
// //   <p>学校：${school}</p>
// //   <p>姓名：${name}</p>
// //   <p>准考证号：${id}</p>
// //   <p>总分：${listen}</p>
// //   <p>阅读：${reading}</p>
// //   <p>写作和翻译：${writing}</p>`
// //   sendMail('理工喵', '1260977477@qq.com', '<理工喵>四六级预约查询结果', emailData)
// // })

// // const getCetHandler = async (id, name, index) => {
// //   const data = await getCet(id, name)
// //   const grade = data.total ? data : {
// //     error: '信息错误',
// //   }
// //   if (grade.error) {
// //     count += 1
// //   }

// //   const info = await OrderCetStudents.findOneAndUpdate({
// //     ticketNumber: id,
// //     name,
// //   }, {
// //     grade,
// //   })
// //   console.log(index, '大大', grade.error)
// //   return info
// //   // const emailData = grade.error ?
// //   //   `您的预约信息（姓名：${info.name}, 准考证号: ${info.ticketNumber}）有误，没有查到成绩，`
// //   // sendMail('理工喵', info.email, '<理工喵>四六级预约查询结果', '<h1><h1>')
// // }


// const getUsers = async (ctx) => {
//   const page = ctx.query.page

//   const data = await OrderCetStudents.find().skip(page * 200).limit(200)

//   const plist = data.reduce((list, item, index) => {
//     const a = getCetHandler(item.ticketNumber, item.name, index)
//     list.push(a)
//     return list
//   }, [])
//   await Promise.all(plist)
//   console.log('出错人数', count)
//   ctx.body = {
//     data,
//   }
// }

// const getCetHandler = async (ctx) => {
//   const { id, name, username } = ctx.query
//   const data = await getCet(id, name, username)
//   const grade = data.total ? data : {
//     error: '信息错误',
//   }
//   // const info = await OrderCetStudents.findOneAndUpdate({
//   //   ticketNumber: id,
//   //   name,
//   // }, {
//   //   grade,
//   // })
//   // const emailData = grade.error ?
//   //   `您的预约信息（姓名：${info.name}, 准考证号: ${info.ticketNumber}）有误，没有查到成绩，`
//   // sendMail('理工喵', info.email, '<理工喵>四六级预约查询结果', '<h1><h1>')

//   ctx.body = {
//     data: {
//       status: 200,
//       data,
//     },
//   }
// }

// module.exports = {
//   getUsers,
//   getCetHandler,
//   // orderInfo,
// }

// // {
// //   "_id" : ObjectId("5c1a0c30dafbfe4c9a2c90d0"),
// //     "examDate" : 201812,
// //       "openid" : "oZQLs0GJXrjwg1mX374fn1bWXkOo",
// //         "username" : "1630020105",
// //           "name" : "管欣宸",
// //             "ticketNumber" : 372260182201502.0,
// //               "email" : "873391224@qq.com",
// //                 "__v" : 0
// // }
