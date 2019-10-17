import * as Koa from 'koa'
import { action, Dic } from '..'
import life from '../life'
import lib from './lib'
import middleware from './middleware'

export default async (option: { base?: string, apps: Dic<string> }) => {

  lib.showBootInfo()

  const koa = new Koa()

  await life.created()

  // 初始化路由
  action.attach(option.base || '', option.apps)

  // 初始化koa中间件
  middleware(koa)

  const port = parseInt(process.env.PORT as string) || 8000
  koa.listen(port, async () => {
    await life.started()
    lib.showBootInfo(port)
  })

};
