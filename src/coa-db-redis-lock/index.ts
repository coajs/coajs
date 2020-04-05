import { $, _, die, env, secure } from '..'
import redis from '../coa-db-redis/redis'

const D = { series: 0 }

class Lock {
  private readonly id: string
  private readonly value: string
  private readonly ms: number

  constructor (id: string, ms: number) {
    this.id = env.redis.prefix + '-aac-lock-' + secure.md5(id)
    this.value = env.hostname + (++D.series) + _.random(true)
    this.ms = ms
  }

  async lock () {
    return await redis.set(this.id, this.value, 'PX', this.ms, 'NX')
  }

  async unlock () {
    return await redis.get(this.id) === this.value ? await redis.del(this.id) : -1
  }

}

export default new class {

  // 开始共享阻塞锁事务
  async start<T> (id: string, worker: () => Promise<T>, ms = 2000) {

    const lock = new Lock(id, ms)

    // 判断是否能锁上，如果不能锁上，则等待锁被释放
    while (!await lock.lock()) {
      await $.timeout(200)
    }

    // 执行操作，无论是否成功均释放锁
    return await worker().finally(() => {
      lock.unlock().then()
    })

  }

  // 尝试事务，如果正在进行则直接报错
  async try<T> (id: string, worker: () => Promise<T>, ms = 2000) {

    const lock = new Lock(id, ms)

    // 判断是否能锁上，如果不能锁上，则直接报错
    await lock.lock() || die.hint('Running')

    // 执行操作，无论是否成功均释放锁
    return await worker().finally(() => {
      lock.unlock().then()
    })

  }
}