import { $, _, Context, DataSet, echo, secure } from '..'

export default {

  session_store: null as any,

  get session () {
    const ctx = this as Context
    return {
      get (name: string): DataSet {
        if (!ctx.session_store) {
          const session_string = ctx.input(name.toLowerCase()) || ''
          ctx.session_store = secure.session_decode(session_string) || {}
        }
        return ctx.session_store
      },
      set (name: string, value: DataSet, ms: number, cookie = false) {
        const session = secure.session_encode(value, ms)
        cookie && ctx.cookies.set(name.toLowerCase(), session, { maxAge: ms, httpOnly: false, secure: false })
        return session
      },
    }
  },

  input (name: string) {
    const ctx = this as Context
    return ctx.headers[name] || ctx.cookies.get(name) || ctx.params[name] || ctx.query[name] || ctx.request.body[name] || undefined
  },

  required<T> (id: string, value: T) {
    const ctx = this as Context
    const data = ctx.header[id] || ctx.request.body[id] || ctx.query[id] || undefined
    return $.checkParam(id, value, data, true)
  },

  have<T> (id: string, value: T) {
    const ctx = this as Context
    const data = ctx.header[id] || ctx.request.body[id] || ctx.query[id] || undefined
    return $.checkParam(id, value, data, false)
  },

  page () {
    const ctx = this as Context
    const rows = _.toInteger(ctx.query.rows) || 20
    const last = _.toInteger(ctx.query.last) || 0
    return { rows, last }
  },

  jsonOk (body = {}, state?: {}) {
    const that = this as Context
    that.body = { code: 200, body, state }
  },

  jsonFail (message = 'Error', code = 400, mark = 0) {
    const that = this as Context
    that.body = { code, mark, message }

    echo.warn('# 请求: %s %s %j', that.method, that.url, that.request.body)
    echo.warn('# 返回: %j', that.body)
  },

  jsonAnyFail (e: any) {

    const info: any = e.info || {}

    // 打印错误
    if (!info.tips) {
      const errorInfo = e.stack || e.toString() || ''
      echo.error(errorInfo)
    }

    if (info.code && info.message) {// 自定义错误
      this.jsonFail(info.message, info.code, info.mark)
    } else {// 其他错误
      this.jsonFail(e.toString(), 500)
    }

  },

  htmlOk (content: string) {
    const that = this as Context
    that.body = content
  },

  htmlFail (message = 'Page Error', status = 404) {
    const that = this as Context
    that.body = message
    that.status = status
  },

  bufferShowOk (body: string | Buffer, type: string) {
    const that = this as Context
    that.body = body
    that.type = type
  },

  bufferDownOk (body: string | Buffer, filename: string) {
    const that = this as Context
    that.body = body
    that.attachment(filename)
  },

  fileDownOk (filename: string) {
    const that = this as Context
    that.filename = filename
  }
}
