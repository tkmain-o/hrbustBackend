const phantom = require('phantom');
const qiniu = require('node-qiniu');
const fs = require('fs');
const Thenjs = require('thenjs');
const log = require('bole')('pushQiniuImage')

let thenjsList = Thenjs;
qiniu.config({
  access_key: '6n1HQs5Yk2UGP7EJ1K3CsXXLbphiUTVvsYIZmncL',
  secret_key: 'XzgLuAQHwIlciJMYjLj9bmt3Qdc3Q383S2NDY0ni',
});

const imagesBucket = qiniu.bucket('hrbust');
let phantomCount = 0;

function pushQiniuImage(url, imageName) {
  const promise = new Promise((resolve) => {
    thenjsList = thenjsList.series([
      (cont) => {
        phantom.create().then((ph) => {
          ph.createPage().then((page) => {
            page.setting('userAgent', 'foo app');
            page.open(url).then(() => {
              const path = `${__dirname}/../cacheImages/${imageName}`;
              page.render(path).then(() => {
                imagesBucket.putFile(imageName, path, (err) => {
                  phantomCount += 1;
                  log.info(`finised phantom count:${phantomCount}`);
                  resolve(err);
                  try {
                    fs.unlinkSync(path);
                  } catch (error) {
                    log.error(error);
                  }
                });
                page.close();
                ph.exit();
                cont();
              });
            });
          });
        });
      },
    ]);
  });
  return promise;
}

exports.pushQiniuImage = pushQiniuImage;
