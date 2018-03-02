const xlsx = require('node-xlsx');
const charset = require('superagent-charset');
const superagent = charset(require('superagent'));
const cheerio = require('cheerio');
const cetData = require('./util/getTestData').cetData;

const excelName = '2017y.xls';
const list = xlsx.parse(`${__dirname}/util/${excelName}`);
const data = list[0].data;
// console.log(data);
const len = data.length - 1;
function check(user) {
  let id = '';
  let name = '';
  for (let i = 1; i < len; i += 1) {
    if (data[i][5] === user) {
      id = data[i][2];
      name = data[i][3];
      break;
    }
  }
  return {
    id,
    name,
  };
}

const getRandomIp = () => {
  const arr = [];
  for (let i = 0; i < 4; i += 1) {
    arr.push(Math.floor(Math.random() * 255));
  }
  return arr.join('.');
};
const options = {
  encoding: 'utf8',
  headers: {
    Referer: 'http://www.chsi.com.cn/cet/',
    // 'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.75 Safari/537.36',
    // 客户端的 IP 地址
    'X-Forwarded-For': `${getRandomIp()}`,
  },
};

function getCetCaptcha() {
  return new Promise((resolve) => {
    superagent
      .get('http://www.chsi.com.cn/cet/ValidatorIMG.JPG')
      .end((err, response) => {
        const cookie = response.headers['set-cookie'];
        // console.log(response.body);
        const buffer = new Buffer(response.body, 'base64');
        resolve({
          base64: buffer.toString('base64'),
          cookie,
        });
      });
  });
}
function getCet(name, id, username, yzm, cookie) {
  const promise = new Promise((resolve) => {
    // 测试账号数据
    if (username === '1234') {
      resolve(cetData);
      return;
    }
    let idt = id;
    let namet = name;
    if (username) {
      const mes = check(username);
      idt = mes.id;
      namet = mes.name;
    }
    const param = `zkzh=${idt}&xm=${namet}&yzm=${yzm}`;
    const url = `http://www.chsi.com.cn/cet/query?${encodeURI(param)}`;

    options.headers.cookie = cookie;
    superagent
      .get(url)
      .charset()
      .set(options.headers)
      .end((err, response) => {
        if (err) {
          // console.log('get index is error');
          resolve({
            error: err,
          });
        } else {
          const bod = response.text;
          const $ = cheerio.load(bod);
          // console.log(bod);
          const $result = $('table.cetTable td');
          const $error = $('.error');
          const result = {};
          if ($error && $error.text().indexOf('验证码不正确') > -1) {
            result.error = '验证码不正确';
            resolve(result);
            return;
          }
          result.data = [];
          result.data.push({
            name: namet,
            school: $result.eq(1).text().trim(),
            type: $result.eq(2).text().trim(),
            id: idt,
            total: $result.eq(4).text().trim(),
            listen: $result.eq(6).text().trim(),
            reading: $result.eq(8).text().trim(),
            writing: $result.eq(10).text().trim(),
          });
          resolve(result);
        }
      });
  });
  return promise;
}

exports.getCet = getCet;
exports.getCetCaptcha = getCetCaptcha;
