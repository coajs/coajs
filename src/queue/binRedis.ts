import { cache } from '..'

const tableName = 'aac_uuid', nspId = 'ID:'

export default new class {

  private async newNo (key1: string, step = 1) {
    return await cache.redis.hincrby(cache.key(tableName), nspId + key1, step)
  }

  private async clearNo (key1: string) {
    await cache.redis.hdel(cache.key(tableName), nspId + key1)
  }
}