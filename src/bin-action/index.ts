import * as fg from 'fast-glob'
import { _, Action, Apps, env } from '..'
import docs from './docs'
import route from './route'
import html from './tpl/html'

let BASE = 'cgi', SEP = '.'

// 添加action文件
const actions = () => {

  const files = fg.sync('apps*/**/action.js', { cwd: process.env.NODE_PATH })

  _.forEach(files, filename => {

    const file = require(filename).default as Action
    const group = _.startCase(filename.replace(/apps-?(.*?)\/(.*?)\/.*/, '$1$2'))

    // 遍历当前action下所有的路由
    _.forEach(file, (v, path) => {

      // 处理path
      if (SEP !== '.') path = path.replace(/\./g, SEP)
      if (path.startsWith(SEP)) path = path.substr(1)
      path = BASE + path

      const options = v.options || {}
      const handle = v.default
      const method = _.toLower(options.method || '')

      // 如果控制器和名称不存，则直接返回
      if (!options.name || !handle) return

      // 将当前控制器加入到分组
      options.group = group

      route.append(path, method, handle)
      docs.append(path, method, options)

    })
  })
}

// 添加action文件
const actionDoc = () => {

  const docPath = env.docs.path.replace(/\/$/, '')

  // 版本信息
  route.router.get(BASE + 'version', ctx => {
    ctx.body = env.version
  })
  // 文档UI
  route.router.get(docPath, ctx => {
    if (ctx.path === docPath) return ctx.redirect(docPath + '/')
    ctx.body = html(BASE, SEP)
  })
  // 文档内容
  route.router.get(docPath + '.json', ctx => {
    const protocol = ctx.header['x-client-scheme'] || ctx.header['x-scheme'] || ctx.protocol
    const host = ctx.header['ali-swift-stat-host'] || ctx.host.replace(':8081', '')
    docs.server.url = protocol + '://' + host
    ctx.body = docs.docs
  })
}

export default new class {

  attach (base: string, sep: string, apps: Apps) {

    if (!base.startsWith('/')) base = '/' + base
    if (!base.endsWith(sep)) base = base + sep

    BASE = base
    SEP = sep

    // 配置
    docs.options()

    // 遍历apps分组
    docs.tags(apps)

    // 处理actions
    actions()

    // 处理doc
    actionDoc()

  }

  routes () {
    return route.router.routes()
  }
}
