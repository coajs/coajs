import { _, cache, die, env, mongo, mysql } from '..'

const tableName = 'uuid', nspId = 'ID:', nspDuration = 24 * 3600 * 1000, maxIndex = 9990

export default new class {

  maxIndex = maxIndex

  async newSaltInfo () {
    const key1 = this.getKey1()
    const key2 = await this.newNo(key1.toString())
    if (key2 === 1)
      await this.clearNo((key1 - 3).toString())
    return [key1, key2]
  }

  public getKey1 () {
    return _.toInteger(_.now() / nspDuration)
  }

  async newNo (key1: string) {
    let no = 0
    if (env.mysql.host) no = await this.newNoByMysql(key1)
    else if (env.mongo.host) no = await this.newNoByMongo(key1)
    else if (env.redis.host) no = await this.newNoByRedis(key1)
    return no
  }

  async clearNo (key1: string) {
    if (env.mysql.host) await this.clearNoByMysql(key1)
    else if (env.mongo.host) await this.clearNoByMongo(key1)
    else if (env.redis.host) await this.clearNoByRedis(key1)
  }

  private async newNoByRedis (key1: string, step = 1) {
    return await cache.redis.hincrby(cache.key(tableName), nspId + key1, step)
  }

  private async clearNoByRedis (key1: string) {
    await cache.redis.hdel(cache.key(tableName), nspId + key1)
  }

  private async newNoByMysql (key1: string) {
    return await mysql.transaction(async trx => {
      const id = nspId + key1
      const data = await trx(tableName).first('no').where({ id }).forUpdate() || {}
      const no = _.toInteger(data.no) + 1
      if (no === 1) await trx(tableName).insert({ id, no })
      else await trx(tableName).update({ no }).where({ id })
      return no
    })
  }

  private async clearNoByMysql (key1: string) {
    await mysql(tableName).delete().where({ id: nspId + key1 })
  }

  private async newNoByMongo (key1: string) {
    const data = await mongo.get().collection(tableName).findOneAndUpdate({ _id: nspId + key1 }, { $inc: { no: 1 } }, { upsert: true, returnOriginal: false })
    return data.value.no as number || die.hint('无法获取no')
  }

  private async clearNoByMongo (key1: string) {
    await mongo.get().collection(tableName).deleteOne({ _id: nspId + key1 })
  }
}