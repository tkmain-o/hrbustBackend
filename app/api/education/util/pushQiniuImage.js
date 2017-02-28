const phantom = require('phantom');
const qiniu = require('node-qiniu');
const fs = require('fs');

qiniu.config({
  access_key: '6n1HQs5Yk2UGP7EJ1K3CsXXLbphiUTVvsYIZmncL',
  secret_key: 'XzgLuAQHwIlciJMYjLj9bmt3Qdc3Q383S2NDY0ni',
});

const imagesBucket = qiniu.bucket('haligong-test');

function pushQiniuImage(url, imageName) {
  const promise = new Promise((resolve, reject) => {
    phantom.create().then(function(ph) {
      ph.createPage().then(function(page) {
        page.setting('userAgent', 'foo app');
        page.open(url).then(function(status) {
          const path = `${__dirname}/../newsImages/${imageName}`;
          page.render(path).then(() => {
            pushQiniu(imageName, path);
          });
          page.close();
          ph.exit();
        });
      });
    });
  });
  return promise;
}

function pushQiniu(imageName, path) {
  imagesBucket.putFile(imageName, path, function(err, reply) {
    // if (err) {
    //   return console.error(err);
    // }
    // console.dir(reply);
  });
}

exports.pushQiniuImage = pushQiniuImage;
