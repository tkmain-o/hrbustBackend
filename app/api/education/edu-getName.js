const SimulateLogin = require('./util/simulateLogin').SimulateLogin;
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const charset = require('superagent-charset');
const superagent = charset(require('superagent'));

const url = {
  login_url: 'http://jwzx.hrbust.edu.cn/academic/common/security/login.jsp',
  captcha_url: 'http://jwzx.hrbust.edu.cn/academic/getCaptcha.do',
  check_url: 'http://jwzx.hrbust.edu.cn/academic/j_acegi_security_check?',
};


// 浏览器请求报文头部部分信息
const browserMsg = {
  'Accept-Encoding': 'gzip, deflate',
  Origin: 'http://jwzx.hrbust.edu.cn',
  'Content-Type': 'application/x-www-form-urlencoded',
};


function getUserName(params) {
  const SimulateLoginParams = {
    username: params.username,
    password: params.password,
    simulateIp: params.simulateIp,
    yourCookie: params.yourCookie,
    callback(result) {
      if (result.error) {
        params.callback({
          error: result.error,
        });
      } else {
        superagent
          .get('http://jwzx.hrbust.edu.cn/academic/showHeader.do')
          .charset()
          .set(browserMsg)
          .set('Cookie', result.cookie)
          .redirects(0)
          .end((error, response) => {
            if (error) {
              params.callback({
                error,
              });
            } else {
              const body = response.text;
              const $ = cheerio.load(body);
              const results = $('#greeting span').text();
              params.callback({
                name: results,
              });
            }
          });
      }
    },
  };
  new SimulateLogin(SimulateLoginParams);
}

exports.getUserName = getUserName;
