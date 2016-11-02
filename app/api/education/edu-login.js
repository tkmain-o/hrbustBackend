var SimulateLogin = require('./util/simulateLogin').SimulateLogin;

function login(params) {
  var SimulateLoginParams = {
    username: params.username,
    password: params.password,
    callback: function(result) {
      if (result.error) {
        params.callback({
          error: result.error
        });
      } else {
        params.callback({
          cookie: result.cookie,
          thisWeek: result.thisWeek
        });
      }
    },
    simulateIp: params.simulateIp,
    yourCookie: params.yourCookie
  }
  new SimulateLogin(SimulateLoginParams);
}
exports.login = login;