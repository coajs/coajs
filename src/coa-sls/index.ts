import { $, _, Dic, echo, env } from '..'
import bin from './bin'

export default new class {

  public enable = bin.enable
  private queue = [] as any[]
  private isWorking = false

  async log (store: string, data: Dic<string | number>) {
    if (!bin.enable) return
    this.queue.push({ store, data, time: _.now() })
    this.init().then()
  }

  private async init () {
    if (this.isWorking) return
    this.isWorking = true
    while (await this.do()) {}
    this.isWorking = false
  }

  private async do () {
    await $.timeout(1000)
    const count = _.min([this.queue.length, 500]) || 0
    if (count < 1) return false
    const logs = [] as any[]
    _.times(count, () => {
      const queue = this.queue.shift() as any
      const time = _.round(queue.time / 1000)
      const contents = [
        { key: 'store', value: queue.store },
        { key: 'time', value: queue.time.toString() },
        { key: 'env', value: env.runEnv },
      ]
      _.forEach(queue.data, (value: any, key: string) => {
        if (typeof value !== 'string') try {value = JSON.stringify(value)} catch (e) {value = ''}
        contents.push({ key, value })
      })
      logs.push({ time, contents })
    })
    await bin.logs(logs).catch(e => {echo.error('* SLS上报错误: [%s] %s', '预处理错误', e.toString())})
    return true
  }

}