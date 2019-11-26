import * as Koa from 'koa'
import { _, action, Dic, env } from '..'
import life from '../life'
import bin from './bin'
import middleware from './middleware'

export default async (opt: { base?: string, sep?: string, apps: Dic<string>, started?: () => void }) => {

  bin.showBootInfo()

  const option = _.defaults(opt, { base: 'cgi', sep: '.', app: {}, started: _.noop })

  const koa = new Koa()

  await life.created()

  // 初始化路由
  action.attach(option.base, option.sep, option.apps)

  // 初始化koa中间件
  middleware(koa)

  const port = parseInt(process.env.PORT as string) || 8000
  koa.listen(port, async () => {
    bin.showBootInfo(port)
    await life.started()
    option.started()
    env.started = true
  })

};
