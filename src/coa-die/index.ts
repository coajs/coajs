import { echo } from '..'

export class ContextFailError extends Error {

  code: number
  mark: number | string
  custom: string
  stdout: boolean

  constructor (e: { message: string, code: number, mark: number | string, custom?: string, stdout?: boolean }) {
    super()
    this.name = 'ContextFailError'
    this.message = e.message
    this.code = e.code
    this.mark = e.mark
    this.custom = e.custom || ''
    this.stdout = e.stdout || false
  }
}

export default new class {

  custom (type: string, message: string, code: number = 400, mark: number | string = 0): never {
    throw new ContextFailError({ code, mark, message, custom: type })
  }

  hint (message: string, code: number = 400, mark: number | string = 0): never {
    throw new ContextFailError({ code, mark, message })
  }

  error (message: string, code: number = 400, mark: number | string = 0): never {
    throw new ContextFailError({ code, mark, message, stdout: true })
  }

  missing (name: string) {
    return this.error('缺少' + name + '参数')
  }

  echo (message: string, code: number = 400, mark: number = 0) {
    echo.error(message)
    return this.error(message, code, mark)
  }
}