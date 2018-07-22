const cheerio = require('cheerio');
const charset = require('superagent-charset');
const superagent = charset(require('superagent'));

const browserMsg = {
  Accept: '*/',
  'Accept-Encoding': 'gzip, deflate',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Cache-Control': 'no-cache',
  clientType: 'json',
  Connection: 'keep-alive',
  'Content-Type': 'text/plain;charset=UTF-8',
  Host: 'sis.hrbust.edu.cn',
  Origin: 'http://sis.hrbust.edu.cn',
  Pragma: 'no-cache',
  Referer: 'http://sis.hrbust.edu.cn/dcp_sinlgePage/forward.action?path=/portal/new&p=sisweblink&sid=sis_ywxtzjpz&param=QHNpc195d3h0empwejAxQHNpc195d3h0empwejAxMDNAMDk5MDFAQHVuZGVmaW5lZEB1bmRlZmluZWRAdW5kZWZpbmVkQHVuZGVmaW5lZEB1bmRlZmluZWRAdW5kZWZpbmVkQHVuZGVmaW5lZA==',
  render: 'json',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36',
};

const getRandomIp = () => {
  const arr = [];
  for (let i = 0; i < 4; i += 1) {
    arr.push(Math.floor(Math.random() * 255));
  }
  return arr.join('.');
};

function gaokaoluqu(name, id) {
  const url = 'http://sis.hrbust.edu.cn/dcp_sinlgePage/weblink/weblink.action';
  const urlkd = 'http://www.ems.com.cn/ems/rand';
  browserMsg['X-Forwarded-For'] = getRandomIp();
  const promise = new Promise((resolve) => {
    superagent
      .post(url)
      .charset()
      .send(`{"map":{"method":"getLqxx","params":{"javaClass":"java.util.ArrayList","list":[{"map":{"ksh":"${id}","xm":"${name}"},"javaClass":"java.util.HashMap"}]}},"javaClass":"java.util.HashMap"}`)
      .set(browserMsg)
      .end((err, response) => {
        if (err) {
          console.error('get gaokaoluqu error');
          resolve({
            error: err,
          });
        } else {
          const body = response.text;
          // const $ = cheerio.load(body);
          // const list = [];
          let bodyd = null;
          try {
            bodyd = JSON.parse(body);
          } catch (e) {
            bodyd = null;
          }
          if (!bodyd || !bodyd.list || bodyd.list.length === 0) {
            // 没有录取信息
            resolve({
              status: 0,
            });
          } else {
            superagent
              .get(urlkd)
              .end((e, res) => {
                const cookie = res.headers['set-cookie'][0];
                const buffer = new Buffer(res.body, 'base64');
                resolve({
                  status: 1,
                  data: bodyd.list,
                  cookie,
                  captcha: buffer.toString('base64'),
                });
              });
          }
          // $('.articleList li').each((index, item) => {
          //   const href = $(item).find('a').attr('href');
          //   const title = $(item).find('a').text().replace(/\s/g, '');
          //   const id = parseInt(href.match(/articleId=(\S*)&/)[1]);
          //   const date = $(item).find('span').text();
          //   // 是否置顶
          //   const top = $(item).find('img').attr('title') === '置顶';
          //   list.push({
          //     title,
          //     id,
          //     date,
          //     top,
          //     href,
          //   });
          // });
          // resolve(list);
        }
      });
  });
  return promise;
}

function luqukuaidi(req, res) {
  const checkCode = req.query.checkCode;
  const id = req.query.id;
  const cookie = req.query.cookie;
  const url = 'http://www.ems.com.cn/ems/order/noticeQuery';
  // console.log(id, checkCode, cookie);
  browserMsg['X-Forwarded-For'] = getRandomIp();
  const promise = new Promise((resolve) => {
    setTimeout(() => {
      superagent
        .post(url)
        .charset()
        .send({
          mailNum: id,
          checkCode,
        })
        .set({
          Cookie: cookie,
          'Content-Type': 'application/x-www-form-urlencoded',
        })
        .end((err, response) => {
          if (err) {
            console.error('get kuadi error');
            resolve({
              error: err,
            });
          } else {
            const body = response.text;
            const $ = cheerio.load(body);
            $('.ms').removeAttr('style');
            $('style').remove();
            $('.show_a').remove();
            // const list = [];
            // console.log(body);
            // getDetail(id).then((result) => {
            //   res.render('site/news', {
            //     data: result,
            //     title: '哈理工教务公告',
            //   });
            // });
            let data = '';
            const errors = $('.errors');
            if (errors.text()) {
              data = `<div class="info-wrapper"><div>输入信息错误，请后退本页面，重新输入。</div><div class="error">错误信息：${errors.text()}</div></div>`;
            } else {
              data = $('.body_content_container').html();
            }
            res.render('site/luqukuaidi', {
              data,
              title: '哈理工录取信息查询',
            });
            // let data = null;
            // try {
            //   data = JSON.parse(body);
            // } catch (e) {
            //   data = null;
            // }
            // if (!data || !data.list || data.list.length === 0) {
            //   // 没有录取信息
            //   resolve({
            //     status: 0
            //   });
            // } else {
            //   resolve({
            //     status: 1,
            //     data: data.list
            //   });
            // }
          }
        });
    }, 1000);
  });
  return promise;
}

exports.gaokaoluqu = gaokaoluqu;
exports.luqukuaidi = luqukuaidi;
