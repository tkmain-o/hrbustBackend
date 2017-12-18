const qiniu = require('node-qiniu');
const stream = require('stream');
const qiniuConfig = require('../../config').qiniu;

qiniu.config(qiniuConfig);

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
