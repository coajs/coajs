import { $, _, env, secure } from '..'
import redis from '../db-redis/redis'

let series = 0
const get_series = () => ++series

class Lock {
  private readonly id: string
  private readonly value: string
  private readonly px: number

  constructor (id: string, px = 2000) {
    this.id = env.redis.prefix + ':lock:' + secure.md5(id)
    this.value = env.hostname + get_series() + _.random(true)
    this.px = px
  }

  async lock () {
    return await redis.set(this.id, this.value, 'PX', this.px, 'NX')
  }

  async unlock () {
    return await redis.get(this.id) === this.value ? await redis.del(this.id) : -1
  }

}

export default {
  // 开始共享阻塞锁事务
  async start<T> (id: string, worker: () => Promise<T>, px = 2000) {

    const lock = new Lock(id, px)

    // 判断是否能锁上，如果不能锁上，则等待锁被释放
    while (!await lock.lock()) {
      await $.timeout(100)
    }

    // 执行操作，无论是否成功均释放锁
    return await worker().finally(() => {
      lock.unlock().then()
    })

  }
}