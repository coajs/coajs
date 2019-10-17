import * as KoaRouter from 'koa-router'
import { _ } from '..'

const route = new KoaRouter()

export default new class {

  base = ''
  router = route

  append (path: string, method: string, action: (ctx: any) => Promise<any>) {

    method = _.toLower(method)
    path = this.base + path

    switch (method) {
      case 'get':
        route.get(path, action)
        break
      case 'post':
        route.post(path, action)
        break
      case 'put':
        route.put(path, action)
        break
      case 'delete':
        route.delete(path, action)
        break
    }
  }
}