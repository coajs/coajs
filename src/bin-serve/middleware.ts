import * as Koa from 'koa'
import * as koaBodyParser from 'koa-bodyparser'
import * as koaMorgan from 'koa-morgan'
import * as koaStatic from 'koa-static'
import { env } from '..'
import bin from './bin'
import context from './context'
import response from './response'

export default (koa: Koa, routes: any) => {
  koa.proxy = true
  koa.use(koaStatic('static'))
  koa.use(koaMorgan(env.isProd ? 'short' : 'dev'))
  koa.use(koaBodyParser({ enableTypes: ['json', 'form', 'text'], extendTypes: { text: ['text/xml'] } }))

  koa.use(response())
  koa.use(routes)

  bin.extend(koa.context, context)
  try {
    bin.extend(koa.context, require('context').default)
  } catch (e) {}
}
