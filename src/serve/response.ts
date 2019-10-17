import * as send from 'koa-send'
import { IContext } from './typings'

export default () => async (ctx: IContext, next: () => Promise<void>) => {
  try {
    await next()
    if (ctx.respond && !ctx.response.body) {
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
