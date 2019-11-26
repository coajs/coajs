import { echo } from '..'
import mQueue from './mQueue'

export class Queue {

  private isWorking = false

  // 发布新的任务
  async push (name: string, data: any, maxTimes = 10) {
    await mQueue.insert({ name, data, maxTimes, status: 1, times: 1 })
    this.do().then()
  }

  // 触发任务
  async do () {
    // 不允许重复工作
    if (this.isWorking) return
    this.isWorking = true
    // 开始工作，直到队列为空
    while (await this.dispatch()) { }
    this.isWorking = false
  }

  protected async worker (name: string, data: any, times: number) {
    return false
  }

  // 分配管理任务
  private async dispatch () {
    const one = await mQueue.pop()
    if (!one)
      return false

    const { queueId, name, data, times } = one
    try {
      const result = await this.worker(name, data, times)
      if (result)
        await mQueue.deleteByIds([queueId])
      else
        await mQueue.updateById(queueId, { status: 2 })
    } catch (e) {
      const reason = e.toString()
      echo.error('任务执行失败: ', reason)
      await mQueue.updateById(queueId, { reason, status: 3 })
    }
    return true
  }

}