const moment = require('moment');
moment.locale('zh-cn');

const courseData = {
  "courseArrange": [
    [
      [{
        "title": "工程流体力学",
        "position": "西-新J501",
        "teacher": "xx老师",
        "messege": "讲课学时",
        "week": "1-15周",
        "weekObj": {
          "start": 1,
          "end": 15
        }
      }],
      [{
        "title": "安全系统工程",
        "position": "西-新J505（一体机）",
        "teacher": "xx老师",
        "messege": "讲课学时",
        "week": "1-17周",
        "weekObj": {
          "start": 1,
          "end": 17
        }
      }],
      [{
        "title": "安全管理与安全监察",
        "position": "西-新J501",
        "teacher": "xx老师",
        "messege": "讲课学时",
        "week": "1-17单周",
        "weekObj": {
          "start": 1,
          "end": 17,
          "parity": "单周"
        }
      }],
      [{
        "title": "材料力学（一）",
        "position": "西-新J507",
        "teacher": "xx老师",
        "messege": "讲课学时",
        "week": "1-17周",
        "weekObj": {
          "start": 1,
          "end": 17
        }
      }],
      [{
        "title": "汽车驾驶（任选）",
        "position": "西1-0307",
        "teacher": "汽车驾驶外聘教师（外聘）",
        "messege": "讲课学时",
        "week": "1-16周",
        "weekObj": {
          "start": 1,
          "end": 16
        }
      }],
      null,
      null
    ],
    [
      [{
        "title": "安全管理与安全监察",
        "position": "西-新J501",
        "teacher": "xx老师",
        "messege": "讲课学时",
        "week": "1-17周",
        "weekObj": {
          "start": 1,
          "end": 17
        }
      }],
      [{
        "title": "机械基础",
        "position": "西-新J511（一体机）",
        "teacher": "xx老师",
        "messege": "讲课学时",
        "week": "1-17单周",
        "weekObj": {
          "start": 1,
          "end": 17,
          "parity": "单周"
        }
      }],
      [{
        "title": "安全工程CAD",
        "position": "西-新J211",
        "teacher": "xx老师",
        "messege": "讲课学时",
        "week": "1-16周",
        "weekObj": {
          "start": 1,
          "end": 16
        }
      }],
      [{
        "title": "机械基础",
        "position": "西-新J511（一体机）",
        "teacher": "xx老师",
        "messege": "讲课学时",
        "week": "1-17周",
        "weekObj": {
          "start": 1,
          "end": 17
        }
      }],
      null, [{
        "title": "材料力学（一）",
        "position": "西-新J507",
        "teacher": "xx老师",
        "messege": "讲课学时",
        "week": "第3周",
        "weekObj": {
          "start": 3,
          "end": 3
        }
      }],
      null
    ],
    [
      null, [{
        "title": "材料力学（一）",
        "position": "西-新J507",
        "teacher": "xx老师",
        "messege": "讲课学时",
        "week": "1-17周",
        "weekObj": {
          "start": 1,
          "end": 17
        }
      }],
      [{
        "title": "电工与电子技术-II",
        "position": "西-新J507",
        "teacher": "xx老师",
        "messege": "讲课学时",
        "week": "1-16周",
        "weekObj": {
          "start": 1,
          "end": 16
        }
      }],
      [{
        "title": "工程流体力学",
        "position": "西-新J501",
        "teacher": "xx老师",
        "messege": "讲课学时",
        "week": "1-14双周",
        "weekObj": {
          "start": 1,
          "end": 14,
          "parity": "双周"
        }
      }],
      null,
      null,
      null
    ],
    [
      null, [{
        "title": "毛中特概论",
        "position": "西-新J409",
        "teacher": "xx老师",
        "messege": "讲课学时",
        "week": "1-15周",
        "weekObj": {
          "start": 1,
          "end": 15
        }
      }],
      [{
        "title": "体育-Ⅳ5",
        "position": "西区操场",
        "teacher": "xx老师",
        "messege": "讲课学时",
        "week": "1-8周",
        "weekObj": {
          "start": 1,
          "end": 8
        }
      }],
      [{
        "title": "毛中特概论",
        "position": "西-新J409",
        "teacher": "xx老师",
        "messege": "讲课学时",
        "week": "1-15周",
        "weekObj": {
          "start": 1,
          "end": 15
        }
      }],
      [{
        "title": "电工与电子技术-II",
        "position": "西-新J507",
        "teacher": "xx老师",
        "messege": "讲课学时",
        "week": "1-15单周",
        "weekObj": {
          "start": 1,
          "end": 15,
          "parity": "单周"
        }
      }],
      null,
      null
    ],
    [
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ]
  ],
  "noArrangement": [
    [
      "课程号",
      "课程名称",
      "课序号",
      "任课教师",
      "合班",
      "上课周次",
      "星期",
      "上课地点"
    ],
    [
      "050215SI02W4",
      "课程设计（安全）",
      "1",
      "郭抗抗",
      "安全15-1,安全15-2",
      "18-19周",
      "",
      ""
    ]
  ],
}

const gradeData = {
  "data": [
    [
      "2017",
      "春",
      "0000A20N0",
      "学术基本要素-专业论文写作（网络）（公共）",
      "1",
      "公共基础课[2012]",
      "46",
      "2",
      "14",
      "任选",
      "正常",
      "正常考试",
      "不及格"
    ],
    [
      "2017",
      "春",
      "0000B21N0",
      "个人理财规划（网络）（人文）",
      "1",
      "人文、社科、经管类选修课[2012]",
      "67",
      "2",
      "11",
      "任选",
      "正常",
      "正常考试",
      "及格"
    ],
    [
      "2017",
      "春",
      "0501C02W4",
      "工程光学",
      "2",
      "学科基础课",
      "80",
      "4",
      "60",
      "必修",
      "正常",
      "正常考试",
      "及格"
    ],
    [
      "2017",
      "春",
      "0501C10W4",
      "信号与系统",
      "2",
      "学科基础课",
      "89",
      "2",
      "42",
      "必修",
      "正常",
      "正常考试",
      "及格"
    ],
    [
      "2017",
      "春",
      "0501C11W4",
      "可靠性工程",
      "1",
      "学科基础选修课",
      "70",
      "2",
      "30",
      "限选",
      "正常",
      "正常考试",
      "及格"
    ],
    [
      "2017",
      "春",
      "0501G02W4",
      "课程设计（工程光学）",
      "3",
      "实践教学环节",
      "良",
      "1",
      "1",
      "必修",
      "正常",
      "正常考试",
      "及格"
    ],
    [
      "2017",
      "春",
      "0701C18S4",
      "计算方法",
      "1",
      "学科基础课",
      "73",
      "2",
      "42",
      "必修",
      "正常",
      "正常考试",
      "及格"
    ],
    [
      "2017",
      "春",
      "1701BA2W4",
      "创业基础",
      "2",
      "人文、社科、经管类素质课[2010]（W）",
      "差",
      "2",
      "30",
      "必修",
      "正常",
      "正常考试",
      "不及格"
    ],
    [
      "2017",
      "春",
      "1900G02W4",
      "电工电子实习（1周）",
      "4",
      "实践教学环节",
      "优秀",
      "1",
      "1",
      "必修",
      "正常",
      "正常考试",
      "及格"
    ],
    [
      "2017",
      "春",
      "1901C42W4",
      "电子技术-II",
      "4",
      "学科基础课",
      "83",
      "3",
      "64",
      "必修",
      "正常",
      "正常考试",
      "及格"
    ],
    [
      "2017",
      "春",
      "1901G42W4",
      "课程设计（数电）",
      "6",
      "实践教学环节",
      "良",
      "1",
      "1",
      "必修",
      "正常",
      "正常考试",
      "及格"
    ],
    [
      "2017",
      "春",
      "7101A01W4",
      "英语（四）",
      "49",
      "公共基础课[2010]（W）",
      "77",
      "4",
      "60",
      "必修",
      "正常",
      "正常考试",
      "及格"
    ],
    [
      "2017",
      "春",
      "7201BA1W4",
      "毛、中、特概论-I",
      "24",
      "人文、社科、经管类素质课[2010]（W）",
      "79",
      "3",
      "36",
      "必修",
      "正常",
      "正常考试",
      "及格"
    ],
    [
      "2017",
      "春",
      "7301A01W4",
      "体育（四）",
      "38",
      "公共基础课[2010]（W）",
      "85",
      "1.5",
      "30",
      "必修",
      "正常",
      "正常考试",
      "及格"
    ]
  ],
  "gradeTerm": "2017春",
  "cookie": "JSESSIONID=24C7BEC6295AB853F18EAE08D6C99BCB.LB01"
}

function getExamData() {
  moment().utcOffset(8);
  const today = moment().utcOffset(8).add(2, 'hours').format('YYYY-MM-DD HH:mm');
  const tomoorow = moment().utcOffset(8).add(1, 'days').format('YYYY-MM-DD HH:mm');
  const examData = {
    "data": [{
      "examCourse": "计算机控制技术与系统",
      "time": `${tomoorow}--${moment().utcOffset(8).add(2, 'hours').format('HH:mm')}`,
      "position": "西区 新教学楼 西-新F305",
      "info": "正常考试"
    }, {
      "examCourse": "自动检测技术及仪表",
      "time": `${today}--${moment().utcOffset(8).add(4, 'hours').format('HH:mm')}`,
      "position": "西区 新教学楼 西-新F303",
      "info": "重考"
    }, {
      "examCourse": "毛、中、特概论-II",
      "time": "2015-12-20 13:30--15:00",
      "position": "西区 新教学楼 西-新A514",
      "info": "正常考试"
    }, {
      "examCourse": "误差理论与数据处理",
      "time": "2015-12-18 13:30--15:10",
      "position": "西区 新教学楼 西-新B408",
      "info": "正常考试"
    }, {
      "examCourse": "自动控制原理",
      "time": "2015-12-16 13:30--15:10",
      "position": "西区 新教学楼 西-新B502",
      "info": "重考"
    }, {
      "examCourse": "传感技术",
      "time": "2015-12-16 10:10--11:50",
      "position": "西区 新教学楼 西-新B308",
      "info": "正常考试"
    }, {
      "examCourse": "专业外语（测控）",
      "time": "2015-12-15 10:10--11:50",
      "position": "西区 新教学楼 西-新B502",
      "info": "正常考试"
    }, {
      "examCourse": "单片机原理",
      "time": "2015-12-14 10:10--11:50",
      "position": "西区 新教学楼 西-新B312",
      "info": "正常考试"
    }, {
      "examCourse": "Matlab",
      "time": "2015-11-17 18:00--19:40",
      "position": "西区 西区一号楼 计算中心机房西1-0604",
      "info": "正常考试"
    }, {
      "examCourse": "微机原理",
      "time": "2015-11-10 18:00--19:40",
      "position": "西区 西区一号楼 计算中心机房西1-0604",
      "info": "正常考试"
    }]
  }
  return examData;
};

// cetData = {
//   "data": [{
//     "name": "李大勇",
//     "school": "哈尔滨理工大学",
//     "type": "英语六级",
//     "id": "1234",
//     "total": "632",
//     "listen": "281",
//     "reading": "221",
//     "writing": "130"
//   }]
// }

cetData = {
  "data": [{
    "name": "胡雨珊",
    "school": "哈尔滨理工大学",
    "type": "英语四级",
    "id": "1234",
    "total": "634",
    "listen": "233",
    "reading": "213",
    "writing": "188"
  }]
}

exports.courseData = courseData;
exports.gradeData = gradeData;
exports.getExamData = getExamData;
exports.cetData = cetData;
