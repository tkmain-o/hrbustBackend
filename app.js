
const Koa = require('koa')

const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const session = require('koa-session-minimal')
const MongoStore = require('koa-generic-session-mongo')
const moment = require('moment')
const { keys } = require('./config/config')
const { mongodb } = require('./utils')
// const WXBizDataCrypt = require('../../utils/WXBizDataCrypt')
app.proxy = true
moment.locale('zh-cn')

// error handler
onerror(app)

app.keys = keys

app.use(session({
  store: new MongoStore({
    url: mongodb,
  }),
}))

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text'],
}))

app.use(json())
app.use(logger())
app.use(require('koa-static')(`${__dirname}/public`))

app.use(views(`${__dirname}/views`, {
  extension: 'ejs',
}))

// session
//
// app.use(async (ctx, next) => {
//   console.log(ctx.session)
// })

// error wrapper
app.use(async (ctx, next) => {
  ctx.session.count = ctx.session.count ? ctx.session.count + 1 : 1
  try {
    // if (ctx.request.path.indexOf('/api/user') < 0 && !ctx.session.openid) {
    //   // 未登录
    //   ctx.throw(401, '微信登录失效')
    //   return
    // }
    await next()
  } catch (e) {
    switch (e.status) {
      case 204: // No Content
      case 400: // Bad Request
      case 401: // Unauthorized
      case 403: // Forbidden
      case 404: // Not Found
      case 406: // Not Acceptable
      case 409: // Conflict
        ctx.status = e.status
        ctx.body = {
          message: e.message,
          status: e.status,
        }
        break
      default:
      case 500: // Internal Server Error
        console.error(e.stack)
        ctx.status = e.status || 500
        ctx.body = app.env === 'development' ? e.stack : e.message
        break
    }
  }
})

// logger
// app.use(async (ctx, next) => {
//   const start = new Date();
//   await next();
//   const ms = new Date() - start;
//   console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
// });

const routes = {
  index: require('./routes/index'),
  // users: require('./routes/users'),
  // 公共 api
  user: require('./routes/user'),
  // 哈理工 api
  hrbust: require('./routes/hrbust'),
}

// routes
// app.use(index.routes(), index.allowedMethods())
// app.use(users.routes(), users.allowedMethods())

Object.keys(routes).forEach(key => {
  const route = routes[key]
  app.use(route.routes(), route.allowedMethods())
})

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
})

module.exports = app
