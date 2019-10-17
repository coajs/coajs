import { echo } from '../index'

export default {
  // 扩展属性
  extend (target: object, ...extend: object[]) {
    extend.forEach(ext => Object.defineProperties(target, Object.getOwnPropertyDescriptors(ext)))
  },
  // 显示启动信息
  showBootInfo (port?: number) {
    const consoleTime = '[server] Startup successful in '
    if (!port) { // 开始
      console.time(consoleTime)
      echo.info('')
      echo.info('[server] Booting...')
    } else { // 结束
      echo.info('[server] Listening on port %d', port)
      console.timeEnd(consoleTime)
    }
  }
}