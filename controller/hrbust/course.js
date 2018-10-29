const crypto = require('crypto')
const superagent = require('superagent')
const cheerio = require('cheerio')
const to = require('../../utils/awaitErrorCatch')
const Students = require('../../models/Students')
const Course = require('../../models/Course')
const TermCourse = require('../../models/TermCourse')

const {
  SimulateLogin,
  requestHeader,
  url,
} = require('../../utils/hrbust')

function md5 (text) {
  return crypto.createHash('md5').update(text).digest('hex')
}

const getPeriod = (startWeek, endWeek, weekType = 0, normalWeekArray) => {
  let period = {}
  if (normalWeekArray) {
    normalWeekArray.forEach((item) => {
      period[item] = 1
    })
  }
  switch (weekType) {
    case 0:
      for (let i = startWeek; i <= endWeek; i++) {
        period[i] = 1
      }
      break
    case 1:
      for (let i = startWeek; i <= endWeek; i++) {
        if (i % 2 === 1) {
          period[i] = 1
        }
      }
      break
    case 2:
      for (let i = startWeek; i <= endWeek; i++) {
        if (i % 2 === 0) {
          period[i] = 1
        }
      }
      break
    default:
      break
  }
  return period
}

// 获取学生id，获取课程表的时候需要用到
const getStudentId = cookie => superagent
  .get(url.studentId)
  .charset()
  .set(requestHeader)
  .set('Cookie', cookie)
  .then(response => {
    const body = response.text
    const $ = cheerio.load(body)
    const str = $('.button')[0].attribs.onclick
    const id = str.match(/id=(\S*)&yearid/) ? str.match(/id=(\S*)&yearid/)[1] : 0
    const getCourseUrl = `http://jwzx.hrbust.edu.cn/academic/manager/coursearrange/showTimetable.do?id=${id}&timetableType=STUDENT&sectionType=COMBINE`
    return getCourseUrl
  })

// 查库，获取当前课表
const getCourse = async (ctx) => {
  let username = ctx.session.username
  if (!username) {
    ctx.throw(400, '未登陆')
  }
  const { term } = ctx.query
  // 获取某学期课表在TermCourse表中的映射
  const [errorStu, { courseMap }] = await to(Students.findOne({ username }))
  if (errorStu) ctx.throw(400, errorStu)

  const termCourseId = courseMap[term]
  const [errorTerm, selectResult] = await to(TermCourse.findOne({ id: termCourseId }))
  if (errorTerm) ctx.throw(400, errorTerm)

  const course = selectResult ? selectResult.course : null
  const courseTermId = selectResult ? selectResult.term : 0
  ctx.body = {
    data: {
      course,
      courseTermId,
    },
    status: 200,
  }
}

// 查库，获取已创建课表的学期
const getHasCourseTerms = async (ctx) => {
  let username = ctx.session.username
  if (!username) {
    ctx.throw(400, '未登陆')
  }
  const [errorStu, { courseMap }] = await to(Students.findOne({ username }))
  if (errorStu) ctx.throw(400, errorStu)

  // 返回结果
  // {
  //     "0": { // 大一
  //         "first": 1, // 第一学期课表存在
  //         "second": 1 // 第二学期课表存在
  //     },
  //     "1": { // 大二
  //         "first": 1 // // 第二学期课表存在
  //     }
  // }
  const result = {}
  Object.keys(courseMap.toObject()).forEach((termNum) => {
    const key = parseInt(termNum / 2)
    const tremid = termNum % 2 ? 'second' : 'first'
    if (!result[key]) {
      result[key] = {}
      result[key][tremid] = 1
    } else {
      result[key][tremid] = 1
    }
  })

  ctx.body = {
    data: result,
    status: 200,
  }
}

// 爬教务在线，更新课表、创建新课表
const updateCourse = async (ctx) => {
  let username = ctx.session.username
  if (!username) {
    ctx.throw(400, '未登陆')
  }

  let cookie = ctx.session.hrbustCookie
  const { term } = ctx.query

  // 学生年级 16、17、18...
  const grade = parseInt(username.substr(0, 2))

  // term
  // 大一第一学期 0
  // 大一第二学期 2
  // 大二第一学期 3
  // ...
  // 大四第二学期 7
  const yearid = grade + 20 + Math.ceil(term / 2)
  const termid = (term % 2) ? 1 : 2

  const { password } = await Students.findOne({ username })
  const simulateLogin = new SimulateLogin({
    username,
    password,
    cookie,
    autoCaptcha: true,
  })
  const [errorLogin, loginResult] = await to(simulateLogin.login())
  if (errorLogin) ctx.throw(400, errorLogin)
  cookie = loginResult.cookie

  const getCourseUrl = await getStudentId(cookie)
  const response = await superagent
    .get(`${getCourseUrl}&termid=${termid}&yearid=${yearid}`)
    .charset()
    .set(requestHeader)
    .set('Cookie', cookie)

  const body = response.text
  const $ = cheerio.load(body, { decodeEntities: false })
  const lessonList = []

  $('#timetable tr') && $('#timetable tr').each((i, e) => {
    if (i === 0) {
      // 表格的第0行是周数
      return
    }
    // 小节课的开始数与结束数
    const sectionstart = i * 2 - 1
    const sectionend = i * 2
    // const course = []
    $(e).children('td') && $(e).children('td').each((j, ele) => {
      if ($(ele).html() === '&nbsp;') {
        // course.push(null)
      } else {
        let html = $(ele).html()
        html = html.replace(/(\s)|(&lt;)|(&gt;)|(;.)|(<<)|(>>)/g, '')
        const arr = html.split('<br>')

        if (arr.length === 0 || !arr[0]) {
          // 没有课
          return
        }

        // 每五组是一节课
        for (let i1 = 0; i1 < (arr.length / 5); i1++) {
          const course = {}
          const week = `${arr[3 + (i1 * 5)]}`

          // 课表有六种情况
          // normal  1-12周
          // single 1-15单周
          // double 1-6双周
          // one 第一周
          // sub 1-7,8-10
          // 剩下一种 5,8,9-17
          const regNormalWeek = /(\w*)\-(\w*)周/
          const regSingleWeek = /(\w*)\-(\w*)单周/
          const regDoubleWeek = /(\w*)\-(\w*)双周/
          const regOneWeek = /第(\w*)周/
          const regSubWeek = /(\w*)\-(\w*),(\w*)\-(\w*)/

          let periodObj = {}
          if (regOneWeek.test(week)) {
            periodObj[week.match(regOneWeek)[1]] = 1
          } else if (regNormalWeek.test(week)) {
            const matchResult = week.match(regNormalWeek)
            const startWeek = parseInt(matchResult[1])
            const endWeek = parseInt(matchResult[2])
            periodObj = getPeriod(startWeek, endWeek, 0)
          } else if (regSingleWeek.test(week)) {
            const matchResult = week.match(regSingleWeek)
            const startWeek = parseInt(matchResult[1])
            const endWeek = parseInt(matchResult[2])
            periodObj = getPeriod(startWeek, endWeek, 1)
          } else if (regDoubleWeek.test(week)) {
            const matchResult = week.match(regDoubleWeek)
            const startWeek = parseInt(matchResult[1])
            const endWeek = parseInt(matchResult[2])
            periodObj = getPeriod(startWeek, endWeek, 2)
          } else if (regSubWeek.test(week)) {
            const matchResult = week.match(regSubWeek)
            const firstStartWeek = parseInt(matchResult[1])
            const firstEndWeek = parseInt(matchResult[2])
            const secondStartWeek = parseInt(matchResult[3])
            const secondEndWeek = parseInt(matchResult[4])
            let firstPeriodObj = getPeriod(firstStartWeek, firstEndWeek, 0)
            let secondPeriodObj = getPeriod(secondStartWeek, secondEndWeek, 0)
            periodObj = Object.assign({}, firstPeriodObj, secondPeriodObj)
          } else {
            const normalWeekArray = week.split(',')
            const startEndArray = normalWeekArray.pop().split('-')
            const startWeek = parseInt(startEndArray[0])
            const endWeek = parseInt(startEndArray[1])
            periodObj = getPeriod(startWeek, endWeek, 0, normalWeekArray)
          }

          course.name = arr[0 + (i1 * 5)]
          course.locale = arr[1 + (i1 * 5)]
          course.teacher = arr[2 + (i1 * 5)]
          course.messege = arr[4 + (i1 * 5)]
          course.sectionstart = sectionstart
          course.sectionend = sectionend
          course.period = periodObj
          course.week = week
          course.day = j + 1

          course.courseId = md5(course.name + course.teacher)
          course.uniqueId = md5(course.name + course.teacher + course.day)

          lessonList.push(course)
        }
      }
    })
  })

  if (lessonList.length === 0) {
    ctx.body = {
      data: '当前学期课表为空',
      status: 404,
    }
    return
  }

  for (const lessonItem of lessonList) {
    const name = lessonItem.name
    const teacher = lessonItem.teacher
    const selectResult = await Course.find({ name, teacher })
    if (selectResult.length !== 0) {
      lessonItem.courseId = selectResult[0].courseId
    }
    try {
      await new Course(lessonItem).save()
    } catch (e) {
      // 重复数据，略过
    }
  }

  const termCourseId = parseInt(username + term)
  await TermCourse.findOneAndUpdate({
    id: termCourseId,
  }, {
    id: termCourseId,
    term,
    course: lessonList,
  }, {
    upsert: true,
  })

  const key = `courseMap.${term}`
  let updateData = {}
  updateData[key] = termCourseId
  await Students.update({ username }, updateData)

  ctx.body = {
    data: '创建新学期课表成功',
    status: 200,
  }
}

module.exports = {
  getCourse,
  getHasCourseTerms,
  updateCourse,
}
