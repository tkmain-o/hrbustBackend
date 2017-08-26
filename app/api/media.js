const express = require('express');

const router = new express.Router();
const upLoadFile = require('./util/qiniu');
const uuidv4 = require('uuid/v4');

router.post('/', async (req, res) => {
  const file = req.files.file;
  let result = {};
  try {
    const reply = await upLoadFile('hrbust-media', uuidv4(), file.data);
    result = {
      status: 200,
      data: {
        image: reply.key,
      },
    };
  } catch (error) {
    result = {
      status: 500,
      error,
      meg: '上传错误，请重新上传',
    };
  }
  res.send(result);
});

module.exports = router;
