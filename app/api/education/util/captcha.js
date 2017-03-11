const parser = require('xml2json');
const Curl = require('node-libcurl').Curl;

function getCaptcha(filePath) {
  const promise = new Promise((resolve) => {
    const curl = new Curl();
    const data = [{
      name: 'file',
      file: filePath,
      type: 'image/png',
    }];

    curl.setOpt(Curl.option.URL, 'http://lab.ocrking.com/ok.html?service=OcrKingForPhoneNumber&language=eng&charset=11&apiKey=ad6be37ba1c990d2faY7WmCyKfGkRcAA90nwglVA4V84JynHFE9lyPIosVFb0PijEwMP9BWgKciII&type=http://t.51chuli.com/contact/d827323fa035a7729w060771msa9211z.gif');
    curl.setOpt(Curl.option.HTTPPOST, data);
    curl.perform();

    curl.on('end', function handler(statusCode, body) {
      let bodyObj = {};
      try {
        bodyObj = JSON.parse(parser.toJson(body)).Results;
      } catch (err) {
        resolve({
          error: `unknow error: ${err}`,
        });
      }
      resolve(bodyObj);
      this.close();
      // fs.unlinkSync( imageFilename );
    });
    curl.on('error', function handler(error) {
      console.error('handler curl error', error);
      resolve({
        error: 'handler curl error',
      });
      this.close();
      // fs.unlinkSync( imageFilename );
    });
  });
  return promise;
}

module.exports = getCaptcha;
