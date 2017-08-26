const express = require('express');
const Message = require('../models/message');
const moment = require('moment');

moment.locale('zh-cn');

const router = new express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await Message.find({}).sort({ _id: -1 });
    let messages = result || [];
    messages = messages.map(message => (Object.assign({}, JSON.parse(JSON.stringify(message)), {
      date: moment(message.date).calendar(),
    })));
    res.send({
      status: 200,
      data: messages,
    });
  } catch (e) {
    res.send({
      status: 500,
      msg: '获取失败',
    });
  }
});

router.post('/', async (req, res) => {
  const { title,
    date,
    image,
    content,
  } = req.body;
  const message = new Message({
    title,
    date,
    image,
    content,
  });
  try {
    await message.save();
    res.send({
      status: 200,
      msg: '上传成功',
    });
  } catch (e) {
    res.send({
      status: 500,
      msg: '上传失败',
    });
  }
});

// router.delete('/', (req, res) => {
//
// });

module.exports = router;
