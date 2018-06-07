const cheerio = require('cheerio');
const charset = require('superagent-charset');
const superagent = charset(require('superagent'));

const browserMsg = {
  'Accept-Encoding': 'gzip, deflate',
  Origin: 'http://202.118.201.228',
  'Content-Type': 'application/x-www-form-urlencoded',
};

const getRandomIp = () => {
  const arr = [];
  for (let i = 0; i < 4; i += 1) {
    arr.push(Math.floor(Math.random() * 255));
  }
  return arr.join('.');
};

function getList(page) {
  let url = 'http://202.118.201.228/homepage/infoArticleList.do?columnId=354';

  browserMsg['X-Forwarded-For'] = getRandomIp();

  const pageNum = page || 1;

  if (page) {
    url = `${url}&pagingPage=${pageNum}`;
  }

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
          $('.articleList li').each((index, item) => {
            const href = $(item).find('a').attr('href');
            const title = $(item).find('a').text().replace(/\s/g, '');
            const id = parseInt(href.match(/articleId=(\S*)&/)[1]);
            const date = $(item).find('span').text();
            // 是否置顶
            const top = $(item).find('img').attr('title') === '置顶';
            list.push({
              title,
              id,
              date,
              top,
              href,
            });
          });
          resolve(list);
        }
      });
  });
  return promise;
}

function getDetail(id) {
  const url = `http://202.118.201.228/homepage/infoSingleArticle.do?articleId=${id}&columnId=354`;
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
          resolve($('#article').html());
        }
      });
  });
}

function getNewsList(req, res) {
  const page = req.query.page;
  getList(page).then((result) => {
    res.json(result);
  });
}

function getNewsDetail(req, res) {
  const id = req.query.id;
  getDetail(id).then((result) => {
    res.render('site/news', {
      data: result,
      title: '哈理工教务公告',
    });
  });
}

exports.getNewsList = getNewsList;
exports.getNewsDetail = getNewsDetail;
