import { cache } from '..'

const tableName = 'aac_uuid'

export default new class {

  private async newNo (key1: string, step = 1) {
    return await cache.redis.hincrby(cache.key(tableName), key1, step)
  }

  private async clearNo (key1: string) {
    await cache.redis.hdel(cache.key(tableName), key1)
  }
}