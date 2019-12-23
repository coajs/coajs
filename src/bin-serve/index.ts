import * as Koa from 'koa'
import { _, Apps, env } from '..'
import route from '../bin-serve-route'
import life from '../life'
import bin from './bin'
import middleware from './middleware'

export default async (opt: { base?: string, sep?: string, apps: Apps, started?: () => void }) => {

  bin.showBootInfo()

  const option = _.defaults(opt, { base: 'cgi', sep: '.', app: {}, started: _.noop })

  const koa = new Koa()

  await life.created()

  // 初始化路由
  const routes = route(option.base, option.sep, option.apps)

  // 初始化koa中间件
  middleware(koa, routes)

  const port = parseInt(process.env.PORT as string) || 8000
  koa.listen(port, async () => {
    bin.showBootInfo(port)
    await life.started()
    option.started()
    env.started = true
  })

};
