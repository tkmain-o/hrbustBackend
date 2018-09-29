const superagent = require('superagent')
const cheerio = require('cheerio')
// const Students = require('../../models/Students')

const {
  requestHeader,
  url,
  checkLogin,
} = require('../../utils/hrbust')

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

// 获取周数字符串 例如：1-10周单周 返回 '1 3 5 7 9'
const getSmartPeriod = (start, end, type = 2) => {
  let smartPeriod = ''
  switch (type) {
    case 0:
      // 单周
      for (let i = start; i <= end; i++) {
        // array[i]
        if (i % 2 === 1) {
          smartPeriod += ` ${i}`
        }
      }
      break
    case 1:
      // 双周
      for (let i = start; i <= end; i++) {
        // array[i]
        if (i % 2 === 0) {
          smartPeriod += ` ${i}`
        }
      }
      break
    default:
      for (let i = start; i <= end; i++) {
        smartPeriod += ` ${i}`
      }
  }
  return smartPeriod.trimLeft()
}

// 获取当前课表
const getCourse = async (ctx) => {
  const cookie = ctx.session.hrbustCookie
  const { term, year } = ctx.query

  const isLogin = await checkLogin(ctx)

  if (!isLogin) {
    return false
  }

  const getCourseUrl = await getStudentId(cookie)
  return superagent
    .get(`${getCourseUrl}&termid=${term}&yearid=${year}`)
    .charset()
    .set(requestHeader)
    .set('Cookie', cookie)
    .then((response) => {
      const body = response.text
      const $ = cheerio.load(body, { decodeEntities: false })
      // console.log(body)
      let result = {}
      const noArrangement = []
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
              const week = arr[3 + (i1 * 5)]

              // 处理单双周逻辑
              if (/第/.test(week)) {
                course.smartPeriod = `${week.match(/第(\w*)周/) && parseInt(week.match(/第(\w*)周/)[1])}`
              } else if (/-/.test(week)) {
                // 单周
                if (/单周/.test(week)) {
                  const weekH = week.replace(/单周/, '').split('-')
                  const start = parseInt(weekH[0])
                  const end = parseInt(weekH[1])
                  // course.weekObj.parity = '单周'
                  course.smartPeriod = getSmartPeriod(start, end, 0)
                } else if (/双周/.test(week)) {
                  // 双周
                  const weekH = week.replace(/双周/, '').split('-')
                  const start = parseInt(weekH[0])
                  const end = parseInt(weekH[1])
                  // course.weekObj.parity = '双周'
                  course.smartPeriod = getSmartPeriod(start, end, 1)
                } else {
                  const weekH = week.replace(/周/, '').split('-')
                  const start = parseInt(weekH[0])
                  const end = parseInt(weekH[1])
                  course.smartPeriod = getSmartPeriod(start, end, 2)
                }
              }

              course.name = arr[0 + (i1 * 5)]
              course.locale = arr[1 + (i1 * 5)]
              course.teacher = arr[2 + (i1 * 5)]
              course.messege = arr[4 + (i1 * 5)]
              course.schoolId = 0
              course.schoolName = '哈尔滨理工大学'
              course.sectionstart = sectionstart
              course.sectionend = sectionend
              course.day = j + 1
              course.courseId = 0
              course.period = arr[3 + (i1 * 5)]
              course.week = week
              course.weekObj = {}

              lessonList.push(course)
            }
          }
        })
      })

      $('#noArrangement tr') && $('#noArrangement tr').each((i, e) => {
        noArrangement[i] = []
        if (i === 0) {
          $(e).children('th') && $(e).children('th').each((j, ele) => {
            noArrangement[i].push($(ele).text())
          })
          return
        }
        $(e).children('td') && $(e).children('td').each((j, ele) => {
          const str = $(ele).text()
          const strF = str.replace(/(\s+)|(javascript(.*);)|(&nbsp;)/g, '')
          noArrangement[i].push(strF)
        })
      })
      result = Object.assign(result, { noArrangement, lessonList })
      // callback(result);
      // Students.findOneAndUpdate({
      //   username:
      // })

      ctx.body = {
        data: result,
        status: 200,
      }
    })
    .catch(e => ctx.throw(400, e))
}
module.exports = getCourse
