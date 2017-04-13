const xml2json = require('node-xml2json');
const request = require('request');
const fs = require('fs');

let count = 0;
const spiKeys = [
  // 'ad6be37ba1c990d2faY7WmCyKfGkRcAA90nwglVA4V84JynHFE9lyPIosVFb0PijEwMP9BWgKciII',
  // '7a035b90a8142c343eq9CThVaZK2nbB9kYb1LrOeCxqtH0wl7upz8Hk8pii90sXv6e1kd6qHQ9',
  // 'd5318ae3ade8ffa46fU4NyBvRaaIset9DRkTtw0N5ABttC0pL2nT53PNjjAkOciTpkgHd2bbEJbA',
  '51ef8dc7b3b0b5be53qUWQPIpynwaRCZb2MxvzUXqlsPQYPtbp0CG0Df55dh9vp5BScpESjJcH',
];
function getCaptcha(filePath) {
  if (count >= spiKeys.length - 1) {
    count = 0;
  } else {
    count += 1;
  }
  const promise = new Promise((resolve) => {
    const formData = {
      file: fs.createReadStream(filePath),
    };

    request.post({
      url: `http://lab.ocrking.com/ok.html?service=OcrKingForPhoneNumber&language=eng&charset=11&apiKey=${spiKeys[count]}&type=http://t.51chuli.com/contact/d827323fa035a7729w060771msa9211z.gif`,
      formData,
    }, (err, httpResponse, body) => {
      // console.log(body);
      if (err) {
        console.error('upload failed:', err);
        resolve({
          error: err,
        });
      }
      let bodyObj = {};
      try {
        bodyObj = xml2json.parser(body).results.resultlist;
      } catch (e) {
        console.error(e);
      }
      resolve(bodyObj);
    });
  });
  return promise;
}

module.exports = getCaptcha;
