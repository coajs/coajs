import * as send from 'koa-send'
import { _, Context, sls } from '..'

function reportLog (ctx: Context, start_time: number) {
  const body = _.isPlainObject(ctx.body) ? ctx.body : {}
  const method = ctx.method
  const origin = ctx.realOrigin
  const url = ctx.url
  const path = ctx.path
  const query = ctx.query
  const code = _.toString(body.code || 0)
  const mark = _.toString(body.mark || 0)
  const message = body.message || ''
  const duration = _.toString(Date.now() - start_time)
  sls.log('access', { method, origin, path, query, url, code, mark, message, duration }).then().catch(_.noop)
}

export default () => async (ctx: Context, next: () => Promise<void>) => {
  const start_time = Date.now()
  try {
    await next()
    if (ctx.respond !== false && !ctx.response.body) {
      if (ctx.filename) {
        try {
          ctx.attachment(ctx.filename)
          await send(ctx, ctx.filename)
        } catch (e) {
          ctx.jsonFail(e.toString())
        }
      } else if (ctx.response.status === 404)
        ctx.jsonFail('Not Found: ' + ctx.request.url, 404)
      else
        ctx.jsonFail('Unknown Server Error', 500)
    }
  } catch (e) {
    ctx.jsonAnyFail(e)
  }
  sls.enable && reportLog(ctx, start_time)
}
