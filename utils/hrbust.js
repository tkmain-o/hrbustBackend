module.exports = {
  url: {
    login_url: 'http://202.118.201.228/academic/common/security/login.jsp',
    captcha_url: 'http://202.118.201.228/academic/getCaptcha.do',
    check_url: 'http://202.118.201.228/academic/j_acegi_security_check?',
    index: 'http://202.118.201.228/academic/index.jsp',
    indexHeader: 'http://202.118.201.228/academic/showHeader.do',
    indexListLeft: 'http://202.118.201.228/academic/listLeft.do',
    index_new: 'http://202.118.201.228/academic/index_new.jsp',
    studentId: 'http://202.118.201.228/academic/student/currcourse/currcourse.jsdo?groupId=&moduleId=2000',
  },
  requestHeader: {
    'Accept-Encoding': 'gzip, deflate',
    Origin: 'http://202.118.201.228',
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  // 所有哈理工教务处需要登录的接口，都需要此函数校验是否登录，
  // 若未登录返回验证码，并设置新cookie到session种
}
