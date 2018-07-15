const spawn = require('child_process').spawn;
const moment = require('moment');

function restartHandler() {
  spawn('pm2', ['restart', '0']);
}

function restart() {
  // console.warn(`重新启动验证码: ${moment().format()}`);
  // restartHandler();
  setInterval(() => {
    console.warn(`重新启动验证码 + ${moment().format()}`);
    restartHandler();
  }, 30 * 60 * 1000);
}

exports.restart = restart;
// exports.dumpNow = dumpNow;
