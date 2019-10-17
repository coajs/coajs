import { echo } from '..'

interface IContextFailInfo {
  code: number,
  mark: number | string,
  message: string,
  tips?: boolean,
}

class ContextFail extends Error {
  public info: IContextFailInfo

  constructor (info: IContextFailInfo) {
    super()
    this.name = 'ContextFailError'
    this.message = info.message
    this.info = info
  }
}

export default new class {
  hint (message: string, code: number = 400, mark: number | string = 0): never {
    throw new ContextFail({ code, mark, message, tips: true })
  }

  lack (name: string) {
    return this.hint('缺少' + name)
  }

  error (message: string, code: number = 400, mark: number | string = 0): never {
    throw new ContextFail({ code, mark, message })
  }

  missing (name: string) {
    return this.error('缺少' + name + '参数')
  }

  echo (message: string, code: number = 400, mark: number = 0): never {
    echo.error('')
    throw new ContextFail({ code, mark, message })
  }
}