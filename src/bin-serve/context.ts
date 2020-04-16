import { $, _, Context, echo, secure, Session } from '..'
import { ContextFailError } from '../coa-die'
import { JsonState } from './libs/JsonState'

export default {

  get session (this: Context) {
    const ctx = this
    return {
      get (name: string) {
        const session_name = 'aac-session-store-' + name
        if (!ctx.state[session_name]) {
          const session_string = ctx.getInput(name.toLowerCase()) || ''
          ctx.state[session_name] = secure.session_decode(session_string) || {}
        }
        return ctx.state[session_name]
      },
      set (name: string, value: Session, ms: number, cookie = false) {
        const session_string = secure.session_encode(value, ms)
        cookie && ctx.cookies.set(name.toLowerCase(), session_string, { maxAge: ms, httpOnly: false, secure: false })
        return session_string
      },
    }
  },

  get jsonState () {
    return new JsonState()
  },

  get realOrigin (this: Context) {
    const protocol = this.header['x-client-scheme'] || this.header['x-scheme'] || this.protocol
    const host = this.header['ali-swift-stat-host'] || this.host.replace(':8081', '')
    return protocol + '://' + host
  },

  getInput<T = string> (this: Context, name: string) {
    const result = this.headers[name.toLowerCase()] || this.cookies.get(name) || this.params[name] || this.query[name] || this.request.body[name] || undefined
    return result as T | undefined
  },

  getParam<T = string> (this: Context, name: string) {
    const result = this.params[name] || this.query[name] || this.request.body[name] || undefined
    return result as T | undefined
  },

  getHeader<T = string> (this: Context, name: string) {
    const result = this.headers[name.toLowerCase()] || this.cookies.get(name) || undefined
    return result as T | undefined
  },

  required<T> (this: Context, id: string, value: T) {
    return $.checkParam(id, value, this.getParam(id), true)
  },

  have<T> (this: Context, id: string, value: T) {
    return $.checkParam(id, value, this.getParam(id), false)
  },

  page (this: Context) {
    const rows = _.toInteger(this.query.rows) || 20
    const last = _.toInteger(this.query.last) || 0
    return { rows, last }
  },

  jsonOk (this: Context, body = {}, state?: JsonState) {
    if (state) state = state.value() as any
    this.body = { code: 200, body, state }
  },

  jsonFail (this: Context, message = '未知错误', code: number = 400, mark: string | number = 0) {
    this.body = { code, mark, message }
    echo.warn('# 请求: %s %s %j', this.method, this.url, this.request.body)
    echo.warn('# 返回: %j', this.body)
  },

  jsonAnyFail (this: Context, e: ContextFailError) {
    if (e.name === 'ContextFailError') {
      e.stdout && echo.error(e.stack || e.toString() || '')
      this.jsonFail(e.message, e.code, e.mark)
    } else {
      this.jsonFail(e.toString(), 500)
      echo.error(e.stack || e.toString() || '')
    }
  },

  htmlOk (this: Context, content: string) {
    this.body = content
  },

  htmlFail (this: Context, message = 'Page Error', status = 404) {
    this.body = message
    this.status = status
  },

  // 将buffer直接显示而不是下载
  bufferShowOk (this: Context, body: string | Buffer, type: string) {
    this.body = body
    this.type = type
  },

  // 将buffer当做文件下载
  bufferDownOk (this: Context, body: string | Buffer, filename: string) {
    this.body = body
    this.attachment(filename)
  },

  // 下载文件
  fileDownOk (this: Context, filename: string) {
    this.state['aac-file-down-name'] = filename
  }
}
