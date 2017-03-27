const SimulateLogin = require('./util/simulateLogin');

function login(params) {
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
