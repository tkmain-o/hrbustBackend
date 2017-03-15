const phantom = require('phantom');
const qiniu = require('node-qiniu');
const fs = require('fs');
const Thenjs = require('thenjs');

let thenjsList = Thenjs;
qiniu.config({
  access_key: '6n1HQs5Yk2UGP7EJ1K3CsXXLbphiUTVvsYIZmncL',
  secret_key: 'XzgLuAQHwIlciJMYjLj9bmt3Qdc3Q383S2NDY0ni',
});

const imagesBucket = qiniu.bucket('hrbust');
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
                  resolve(err);
                  try {
                    fs.unlink(path);
                  } catch (error) {
                    console.error(error);
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
