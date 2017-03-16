const cheerio = require('cheerio');
const charset = require('superagent-charset');
const superagent = charset(require('superagent'));
const log = require('bole')('library');
const xml2json = require('node-xml2json');

const browserMsg = {
  'Accept-Encoding': 'gzip, deflate',
  Origin: 'http://jwzx.hrbust.edu.cn',
  'Content-Type': 'application/x-www-form-urlencoded',
};

function getImage(valueList) {
  const url = `http://222.27.200.21/NTRdrBookRetrAjaxImage.aspx?ListISBN=${valueList.join(';')};`;
  const promise = new Promise((resolve) => {
    superagent
      .get(url)
      .set(browserMsg)
      .end((err, response) => {
        if (err) {
          log.error('library error');
          resolve([]);
        } else {
          const urlList = xml2json.parser(response.text).images.imagsurl;
          resolve(urlList);
        }
      });
  });
  return promise;
}

function getBookInfo(idList) {
  const url = `http://222.27.200.21/GetlocalInfoAjax.aspx?ListRecno=${idList.join(';')};`;
  const promise = new Promise((resolve) => {
    superagent
      .get(url)
      .set(browserMsg)
      .end((err, response) => {
        if (err) {
          log.error('library error');
          resolve([]);
        } else {
          const infoList = xml2json.parser(response.text).bookinfo.books;
          resolve(infoList);
        }
      });
  });
  return promise;
}

function library(keyValue, page) {
  const pageNum = page || 1;
  const params = `&strKeyValue=${keyValue}&page=${pageNum}`;
  const url = `http://222.27.200.21/NTRdrBookRetr.aspx?strType=text&strpageNum=10&tabletype=*&strSortType=&strSort=desc${params}`;
  log.info(url);
  const promise = new Promise((resolve) => {
    superagent
      .get(url)
      .charset()
      .set(browserMsg)
      .end((err, response) => {
        if (err) {
          log.error('library error');
          resolve({
            error: err,
          });
        } else {
          const body = response.text;
          const $ = cheerio.load(body);
          const data = [];
          const valueList = [];
          const idList = [];
          $('.resultlist').each((index, item) => {
            const bookInfo = {};
            bookInfo.titleList = $(item).find('.into .title').text().replace(/^\s*|\s*$|\r\t\n/g, '');
            valueList.push($(item).find('#Cbox').val());
            idList.push($(item).find('#StrTmpRecno').val());

            data.push(bookInfo);
          });
          Promise.all([
            getImage(valueList),
            getBookInfo(idList),
          ]).then((values) => {
            const result = {};
            result.data = data.map((item, index) =>
              Object.assign({}, item, { image: values[0][index] }, values[1][index]));

            resolve(result);
          });
        }
      });
  });
  return promise;
}

module.exports = library;
