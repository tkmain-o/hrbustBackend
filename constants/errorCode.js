const errorCode = {
  400001: {
    message: '教务在线登录错误->验证码错误',
  },
  400002: {
    message: '验证码识别错误',
  },
  400003: {
    message: '获取验证码错误',
  },
  400004: {
    message: '获取 cookie 错误',
  },
  400005: {
    message: '登录已经失效',
  },
  400006: {
    message: '教务在线登录错误 -> 密码错误',
  },
  400007: {
    message: '教务在线登录错误 -> 未知错误',
  },
}

exports.errorCode = errorCode

exports.getErrorData = ({ error, code, message }) => ({
  error: error || { message },
  message: (error && error.message) || message || (errorCode[code] && errorCode[code].message),
  code,
})
