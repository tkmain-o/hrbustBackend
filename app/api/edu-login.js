const SimulateLogin = require('./util/simulateLogin');

let loginCount = 0;
function login(params) {
  // 测试账号数据
  loginCount += 1;
  if (params.username === '1234' && params.password === '1234') {
    console.warn('------------loginTest');
    console.warn(`loginCount: ${loginCount}`);
    console.warn(`loginName: ${params.username}`);
    console.warn('------------end');
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
      console.warn('------------loginError');
      console.warn(`loginCount: ${loginCount}`);
      console.warn(`loginName: ${params.username}`);
      console.warn('------------end');
      params.callback({
        error: result.error,
      });
    } else {
      console.warn('------------loginGood');
      console.warn(`loginCount: ${loginCount}`);
      console.warn(`loginName: ${params.username}`);
      console.warn('------------end');
      params.callback(result);
    }
  });
}
exports.login = login;
