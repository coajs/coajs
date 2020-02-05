import { $, _, Context, Dic, echo, secure, Session } from '..'
import { JsonState } from './libs/JsonState'

export default {

  session_store: {} as Dic<Session>,

  get session (this: Context) {
    const ctx = this
    return {
      get (name: string) {
        if (!ctx.session_store[name]) {
          const session_string = ctx.input(name.toLowerCase()) || ''
          ctx.session_store[name] = secure.session_decode(session_string) || {}
        }
        return ctx.session_store[name]
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

  input<T = string> (this: Context, name: string) {
    const result = this.headers[name.toLowerCase()] || this.cookies.get(name) || this.params[name] || this.query[name] || this.request.body[name] || undefined
    return result as T | undefined
  },

  required<T> (this: Context, id: string, value: T) {
    const data = this.header[id] || this.request.body[id] || this.query[id] || undefined
    return $.checkParam(id, value, data, true)
  },

  have<T> (this: Context, id: string, value: T) {
    const data = this.header[id] || this.request.body[id] || this.query[id] || undefined
    return $.checkParam(id, value, data, false)
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

  jsonFail (this: Context, message = 'Error', code = 400, mark = 0) {
    this.body = { code, mark, message }
    echo.warn('# 请求: %s %s %j', this.method, this.url, this.request.body)
    echo.warn('# 返回: %j', this.body)
  },

  jsonAnyFail (this: Context, e: any) {
    if (e.name === 'ContextOk') {
      e.type === 'json' ? this.jsonOk(e.body) : this.htmlOk(e.body)
    } else if (e.name === 'ContextFailError') {
      const info = e.info || {}
      info.tips || echo.error(e.stack || e.toString() || '')
      this.jsonFail(info.message || '未知错误', info.code || 400, info.mark)
    } else
      this.jsonFail(e.toString(), 500)
  },

  htmlOk (this: Context, content: string) {
    this.body = content
  },

  htmlFail (this: Context, message = 'Page Error', status = 404) {
    this.body = message
    this.status = status
  },

  bufferShowOk (this: Context, body: string | Buffer, type: string) {
    this.body = body
    this.type = type
  },

  bufferDownOk (this: Context, body: string | Buffer, filename: string) {
    this.body = body
    this.attachment(filename)
  },

  fileDownOk (this: Context, filename: string) {
    this.filename = filename
  }
}
