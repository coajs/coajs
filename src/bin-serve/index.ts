import * as Koa from 'koa'
import { _, Apps, env } from '..'
import route from '../bin-serve-route'
import life from '../life'
import bin from './bin'
import middleware from './middleware'

export default async (options: { apps: Apps, base?: string, sep?: string }, event: { onStarted?: () => void, onTimer?: () => void } = {}) => {

  bin.showBootInfo()

  const option = _.defaults(options, { base: 'cgi', sep: '.', app: {} })

  if (event.onStarted) life.onAppStarted = event.onStarted
  if (event.onTimer) life.onAppTimer = event.onTimer

  const koa = new Koa()

  await life.onCreated()

  // 初始化路由
  const routes = route(option.base, option.sep, option.apps)

  // 初始化koa中间件
  middleware(koa, routes)

  const port = parseInt(process.env.PORT as string) || 8000
  koa.listen(port, async () => {
    bin.showBootInfo(port)
    await life.onStarted()
    env.started = true
  })

};
