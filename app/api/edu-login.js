const SimulateLogin = require('./util/simulateLogin');

function login(params) {
  // 测试账号数据
  if (params.username === '1234' && params.password === '1234') {
    params.callback({
      cookie: 'test',
    });
    return;
  }

  const SimulateLoginParams = {
    username: params.username,
    password: params.password,
    simulateIp: params.simulateIp,
    yourCookie: params.yourCookie,
  };

  const simulateLogin = new SimulateLogin();
  simulateLogin.init(SimulateLoginParams).then((result) => {
    if (result.error) {
      params.callback({
        error: result.error,
      });
    } else {
      params.callback({
        cookie: result.cookie,
        thisWeek: result.thisWeek,
      });
    }
  });
}
exports.login = login;
