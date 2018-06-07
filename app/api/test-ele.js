const charset = require('superagent-charset');
const superagent = charset(require('superagent'));

// 浏览器请求报文头部部分信息
const browserMsg = {
  'Accept-Encoding': 'gzip, deflate',
  Origin: 'http://202.118.201.228',
};

const getRandomIp = () => {
  const arr = [];
  for (let i = 0; i < 4; i += 1) {
    arr.push(Math.floor(Math.random() * 255));
  }
  return arr.join('.');
};

function testEle(req, res) {
  const { url, mobile } = req.query;
  browserMsg['X-Forwarded-For'] = getRandomIp();
  superagent
    .post('http://ele.jjc.fun')
    .set(browserMsg)
    .send({
      url,
      mobile,
    })
    .redirects(0)
    .end((error, response) => {
      if (error) {
        this.callback({ error });
      }
      res.json(JSON.parse(response.text));
    });
}

module.exports = testEle;
