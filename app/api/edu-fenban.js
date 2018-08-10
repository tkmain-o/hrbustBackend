const charset = require('superagent-charset');
const superagent = charset(require('superagent'));

const browserMsg = {
  // Accept: 'application/json, text/plain, */*',
  // 'Accept-Encoding': 'gzip, deflate',
  // 'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  // 'Cache-Control': 'no-cache',
  // clientType: 'json',
  // Connection: 'keep-alive',
  'Content-Type': 'application/json;charset=UTF-8',
  // Host: 'sis.hrbust.edu.cn',
  // Origin: 'https://inquire.hduhelp.com',
  // Pragma: 'no-cache',
  // Referer: 'https://inquire.hduhelp.com/?media_id=gh_feb8e8d72669',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
};

const getRandomIp = () => {
  const arr = [];
  for (let i = 0; i < 4; i += 1) {
    arr.push(Math.floor(Math.random() * 255));
  }
  return arr.join('.');
};

function fenban(name, id) {
  const url = 'https://inquire.hduhelp.com/mobile/search';
  browserMsg['X-Forwarded-For'] = getRandomIp();
  const promise = new Promise((resolve) => {
    superagent
      .post(url)
      .charset()
      .send({
        cabinet_id: 'QmXz',
        cabinet_index: [
          {
            id: 'J660x',
            type: 1,
            field: '0',
            name: '身份证号',
            value: id,
          },
          {
            id: 'bRRY4',
            type: 1,
            field: '1',
            name: '姓名',
            value: name,
          },
        ],
      })
      .set(browserMsg)
      .end((err, response) => {
        if (err) {
          console.error('get gaokaoluqu error');
          resolve({
            error: err,
          });
        } else {
          const body = JSON.parse(response.text);
          // const $ = cheerio.load(body);
          // const list = [];
          if (body.data.length === 0) {
            resolve({
              error: 0,
              message: '没有查到您的分班信息',
            });
          } else {
            resolve({
              data: body.data,
            });
          }
        }
      });
  });
  return promise;
}

module.exports = fenban;
