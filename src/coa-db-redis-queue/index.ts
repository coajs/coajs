import { _, echo, env, redis } from '..'

const D = { lock: false }
const prefix = env.redis.prefix + '-{aac-queue}-'
const key_pending = prefix + 'pending'
const key_doing = prefix + 'doing'
const key_doing_map = prefix + 'doing-map'
const key_retrying = prefix + 'retrying'
const sep = '^^'

export class Queue {

  doingJobId = ''

  // 初始化任务，interval为上报间隔，默认为10秒上报一次
  async init (interval = 10e3) {
    if (D.lock) return
    D.lock = true

    const redis_queue = redis.duplicate()

    // 队列任务监听器
    setInterval(() => this.interval().then().catch(_.noop), interval)

    // 持续监听队列
    while (1) {
      const jobId = await redis_queue.brpoplpush(key_pending, key_doing, 0)
      await this.onReceive(jobId).catch(_.noop)
    }
  }

  // 推送新任务
  async push (name: string, id: string) {
    const jobId = name + sep + id
    echo.grey('* Queue: push new job %s', jobId)
    return await redis.lpush(key_pending, jobId)
  }

  // 检查队列，force是否强制执行，timeout任务上报超时的时间，默认60秒，interval两次执行间隔，默认60秒
  async retry (force = false, timeout = 60e3, interval = 60e3) {
    const now = _.now()
    // 如果60秒内执行过且没有强制执行，则忽略
    const can = await redis.set(key_retrying, now, 'PX', interval, 'NX')
    if (!can && !force) return

    const [[, doing = []], [, doing_map = {}]] = await redis.pipeline().lrange(key_doing, 0, -1).hgetall(key_doing_map).exec()
    const retryJobIds = [] as string[]

    // 遍历map检查是否超时
    _.forEach(doing_map, (time, jobId) => {
      doing_map[jobId] = now - _.toInteger(time)
      if (doing_map[jobId] >= timeout) retryJobIds.push(jobId)
    })
    // 遍历doing检查是否超时
    _.forEach(doing, jobId => {
      if (!doing_map[jobId] || doing_map[jobId] >= timeout) retryJobIds.push(jobId)
    })

    // 如果存在需要重试的任务
    if (retryJobIds.length) {
      const uniqJobIds = _.uniq(retryJobIds)
      await redis.pipeline().hdel(key_doing_map, ...uniqJobIds).lpush(key_pending, ...uniqJobIds).exec()
    }
  }

  // 任务具体工作者
  protected async worker (name: string, data: string) {

  }

  // 当收到新任务的时候
  private async onReceive (jobId: string) {

    // 准备执行
    const now = _.now()
    const can = await redis.hsetnx(key_doing_map, jobId, now)

    // 如果已经开始，则忽略
    if (!can) return

    // 开始执行
    this.doingJobId = jobId
    echo.grey('* Queue: start job %s', jobId)
    const [jobName, jobData] = jobId.split(sep)
    await this.worker(jobName, jobData).catch(e => {
      echo.error('* Queue JobError %s: %s', jobId, e.toString())
    })

    // 执行结束
    this.doingJobId = ''
    await redis.pipeline().hdel(key_doing_map, jobId).lrem(key_doing, 0, jobId).exec()
    echo.grey('* Queue: job %s completed in %sms', jobId, _.now() - now)
  }

  // 定时检查
  private async interval () {
    // 如果当前有正在执行的任务，报告最新时间
    if (this.doingJobId)
      await redis.hset(key_doing_map, this.doingJobId, _.now())
  }

}