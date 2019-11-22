import * as send from 'koa-send'
import { Context } from './typings'

export default () => async (ctx: Context, next: () => Promise<void>) => {
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
}
