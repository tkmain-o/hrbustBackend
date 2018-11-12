const qiniu = require('node-qiniu')
// const stream = require('stream')
const qiniuConfig = require('../config/config').qiniu

qiniu.config(qiniuConfig)

function upLoadFile (bucket, imageName, buffer) {
  const imagesBucket = qiniu.bucket(bucket)
  return new Promise((resolve, reject) => {
    // console.log(imageName)
    imagesBucket.putFile(imageName, buffer.path, (err, reply) => {
      if (err) {
        reject(err)
        return
      }
      // console.log(reply);
      resolve(reply)
    })
  })
}

module.exports = upLoadFile
