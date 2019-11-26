import * as Koa from 'koa'
import * as koaBodyParser from 'koa-bodyparser'
import * as koaMorgan from 'koa-morgan'
import * as koaStatic from 'koa-static'
import { action, env } from '..'
import bin from './bin'
import context from './context'
import response from './response'

export default (koa: Koa) => {
  koa.proxy = true
  koa.use(koaStatic('static'))
  koa.use(koaMorgan(env.isDev ? 'dev' : 'short'))
  koa.use(koaBodyParser({ enableTypes: ['json', 'form', 'text'], extendTypes: { text: ['text/xml'] } }))

  koa.use(response())
  koa.use(action.routes())
  bin.extend(koa.context, context)

  try {
    bin.extend(koa.context, require('context').default)
  } catch (e) {}
}
