const cheerio = require('cheerio');
const charset = require('superagent-charset');
const superagent = charset(require('superagent'));

const browserMsg = {
  // 'Accept-Encoding': 'gzip, deflate',
  // Origin: 'http://202.118.201.228',
  // 'Content-Type': 'text/html',
  Referer: 'http://www.yingjiesheng.com/',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
};
const getRandomIp = () => {
  const arr = [];
  for (let i = 0; i < 4; i += 1) {
    arr.push(Math.floor(Math.random() * 255));
  }
  return arr.join('.');
};

function getList(page) {
  // const url = `http://www.yingjiesheng.com/commend-fulltime-${page}.html`;
  const url = `http://my.yingjiesheng.com/index.php/personal/xjhinfo.htm/?page=${page}&cid=0&city=0&word=%B9%FE%B6%FB%B1%F5&province=0&schoolid=0&sdate=&hyid=0'`;
  browserMsg['X-Forwarded-For'] = getRandomIp();

  const promise = new Promise((resolve) => {
    superagent
      .get(url)
      .charset()
      .set(browserMsg)
      .end((err, response) => {
        if (err) {
          console.error('get news error');
          resolve({
            error: err,
          });
        } else {
          const body = response.text;
          const $ = cheerio.load(body);
          const list = [];
          $('.campus-detail tr').each((index, item) => {
            const tdEls = $(item).find('td');
            const timeHref = $(tdEls[2]).find('img').attr('src');
            const content = {
              city: $(tdEls[0]).text().replace(/\s/g, ''),
              date: $(tdEls[1]).text().replace(/\s/g, ''),
              time: `http://my.yingjiesheng.com${timeHref}`,
              company: $(tdEls[3]).text().replace(/\s/g, ''),
              school: $(tdEls[4]).text().replace(/\s/g, ''),
              address: $(tdEls[5]).text().replace(/\s/g, ''),
              href: $(tdEls[6]).find('a').attr('href'),
            };
            list.push(content);
          });
          resolve(list);
        }
      });
  });
  return promise;
}

function getDetail(href) {
  const url = `http://my.yingjiesheng.com${href}`;
  return new Promise((resolve) => {
    superagent
      .get(url)
      .charset()
      .set(browserMsg)
      .end((err, response) => {
        if (err) {
          console.error('get news error');
          resolve({
            error: err,
          });
        } else {
          const body = response.text;
          const $ = cheerio.load(body);
          let content;
          $('.screen').each((index, item) => {
            content += $(item).html();
          });
          resolve(content);
        }
      });
  });
}

function getJobList(req, res) {
  const page = req.query.page || 1;
  getList(page).then((result) => {
    res.json(result);
  });
}

function getJobDetail(req, res) {
  const url = req.query.url;
  getDetail(url).then((result) => {
    res.render('site/news', {
      data: result,
      title: '哈理工教务公告',
    });
  });
}

exports.getJobList = getJobList;
exports.getJobDetail = getJobDetail;
