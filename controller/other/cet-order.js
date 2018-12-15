const to = require('../../utils/awaitErrorCatch')
const OrderCetStudents = require('../../models/OrderCetStudents')

const cetOrder = async (ctx) => {
  const {
    username,
    openid,
  } = ctx.session.username
  if (!username) {
    ctx.throw(400, '未登陆')
  }
  const {
    studentId, name, ticketNumber, email,
  } = ctx.request.body

  const data = {
    openid,
    username: studentId,
    name,
    ticketNumber,
    email,
  }

  try {
    await new OrderCetStudents(data).save()
  } catch (e) {
    ctx.body = {
      data: e,
      status: 400,
    }
    return
  }
  ctx.body = {
    data: 'suc',
    status: 200,
  }
}

const orderInfo = async (ctx) => {
  const {
    username,
  } = ctx.session.username
  if (!username) {
    ctx.throw(400, '未登陆')
  }
  const { studentId } = ctx.query

  const [errOrder, data] = await to(OrderCetStudents.findOne({ username: studentId }))
  if (errOrder) ctx.throw(400, errOrder)

  if (!data) {
    ctx.body = {
      data: {
        isOrdered: 0,
      },
      status: 200,
    }
  } else {
    ctx.body = {
      data: {
        isOrdered: 1,
        ...data._doc,
      },
      status: 200,
    }
  }
}

module.exports = {
  cetOrder,
  orderInfo,
}
