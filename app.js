
const Koa = require('koa')

const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const session = require('koa-session-minimal')
const MongoStore = require('koa-generic-session-mongo')
const { keys } = require('./config/config')
const { mongodb } = require('./utils')
// const WXBizDataCrypt = require('../../utils/WXBizDataCrypt')

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
  extension: 'pug',
}))

// session
//
// app.use(async (ctx, next) => {
//   console.log(ctx.session)
// })

// error wrapper
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (e) {
    switch (e.status) {
      case 204: // No Content
      case 400: // Bad Request
      case 401: // Unauthorized
        ctx.status = e.status
        ctx.body = e.message
        break
      case 403: // Forbidden
      case 404: // Not Found
      case 406: // Not Acceptable
      case 409: // Conflict
        ctx.status = e.status
        ctx.body = e.message
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
  users: require('./routes/users'),
  // 公共 api
  api: require('./routes/api'),
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
