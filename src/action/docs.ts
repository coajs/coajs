import { _, Dic, env } from '..'
import swagger from './lib/swagger'

const docs = {
  info: {},
  // externalDocs: {
  //   description: '→ 点击此处，查看其他类型相关文档',
  //   url        : '/docs/#/'
  // },
  openapi: '3.0.0',
  paths: {} as any,
  tags: [] as any,
  definitions: {},
  servers: [{
    description: 'Backend Interface',
    url: ''
  }],
  components: {
    securitySchemes: {
      user: { type: 'apiKey', in: 'header', name: 'uAccess' },
      manager: { type: 'apiKey', in: 'header', name: 'mAccess' },
    }
  },
}

export default new class {

  docs = docs
  server = docs.servers[0]

  tags (tags: Dic<string>) {
    _.forEach(tags, (description, name) => {
      docs.tags.push({ name, description })
    })
  }

  append (path: string, method: string, options: any) {
    docs.paths[path] = docs.paths[path] || {}
    docs.paths[path][method] = swagger(path, method, options)
  }

  options () {
    _.defaultsDeep(docs, env.docs, {
      info: {
        title: '平台接口文档',
        version: env.version,
        description: '平台接口文档，包含用户端和管理端',
      }
    })
  }
}
