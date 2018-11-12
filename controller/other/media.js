const uuidv4 = require('uuid/v4')
const upLoadFile = require('../../utils/qiniu')


// 登录处理函数
const media = async (ctx) => {
  const file = ctx.request.files && ctx.request.files[0]
  // console.log(ctx.request.fields)
  // console.log(file)
  if (!file) {
    ctx.throw(400, '请上传正确的文件')
    return
  }
  // let result = {}
  try {
    const reply = await upLoadFile('hrbust-media', uuidv4(), file)
    // console.log(reply)
    ctx.body = {
      status: 200,
      data: {
        image: reply.key,
      },
    }
  } catch (error) {
    ctx.throw(500, error)
  }
}

module.exports = {
  media,
}
