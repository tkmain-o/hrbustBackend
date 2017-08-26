const qiniu = require('node-qiniu');
const stream = require('stream');

qiniu.config({
  access_key: '6n1HQs5Yk2UGP7EJ1K3CsXXLbphiUTVvsYIZmncL',
  secret_key: 'XzgLuAQHwIlciJMYjLj9bmt3Qdc3Q383S2NDY0ni',
});


function upLoadFile(bucket, imageName, buffer) {
  const imagesBucket = qiniu.bucket(bucket);
  const promise = new Promise((resolve, reject) => {
    const puttingStream = imagesBucket.createPutStream(imageName);
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);
    bufferStream
      .pipe(puttingStream)
      .on('error', (err) => {
        reject(err);
      })
      .on('end', (reply) => {
        resolve(reply);
      });
  });
  return promise;
}

module.exports = upLoadFile;
