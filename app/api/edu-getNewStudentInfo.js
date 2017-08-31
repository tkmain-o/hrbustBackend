const xlsx = require('node-xlsx');
const cheerio = require('cheerio');
const charset = require('superagent-charset');
const superagent = charset(require('superagent'));

const excelName = 'n.xlsx';
const list = xlsx.parse(`${__dirname}/util/${excelName}`);

const infos = list[0].data.reduce((obj, info) => {
  const result = obj;
  if (!result[info[0]]) {
    result[info[0]] = [];
  }
  result[info[0]].push(info);
  return obj;
}, {});

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
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    Origin: 'http://zs.hustrc.cn',
    Referer: 'http://zs.hustrc.cn/baodao/index.php/Stu/index',
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.75 Safari/537.36',
    // 客户端的 IP 地址
    'X-Forwarded-For': `${getRandomIp()}`,
    'Accept-Encoding': 'gzip, deflate',
  },
};

function getRongChengInfo(identity) {
  options.headers['X-Forwarded-For'] = getRandomIp();
  // 荣成校区
  return new Promise((resolve, reject) => {
    const url = 'http://zs.hustrc.cn/baodao/index.php/Stu/select';
    superagent
      .post(url)
      .send({
        idCard: identity.toString(),
      })
      .set(options.headers)
      .end((err, response) => {
        if (err) {
          // console.log('get index is error');
          reject({
            error: err,
          });
        } else {
          const body = response.text;
          const $ = cheerio.load(body);
          if ($('h1').text() === '查无此人') {
            resolve([]);
            return;
          }
          const eleList = $('table').eq(0).find('tr');
          const arr = [];
          eleList.each((index, item) => {
            const title = $(item).find('td').eq(0).text();
            const text = $(item).find('td').eq(1).text();
            arr.push({
              title,
              text,
            });
          });
          resolve(arr);
        }
      });
  });
}

async function getNewStudentInfo(req, res) {
  try {
    if (req.query.identity) {
      console.warn('查询新生信息荣成-------');
      console.warn(req.query.identity);
      console.warn('查询新生信息-------end');
      const result = await getRongChengInfo(req.query.identity);
      res.send({
        status: 200,
        data: result,
      });
    } else {
      console.warn('查询新生信息-------');
      console.warn(req.query.name);
      console.warn('查询新生信息-------end');
      res.send({
        status: 200,
        data: infos[req.query.name] || [],
      });
    }
  } catch (e) {
    res.send({
      status: 500,
      data: '服务器错误',
    });
  }
}

module.exports = getNewStudentInfo;
