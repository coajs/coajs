import { Db, MongoClient } from 'mongodb'
import { die, env } from '../..'

export default new class {

  private mongoDb = {} as Db

  get () {
    return this.mongoDb || die.error('还未初始化，不能调用')
  }

  async init () {
    const host = env.mongo.host
    if (!host) return

    const port = env.mongo.port
    const database = env.mongo.database
    const username = encodeURIComponent(env.mongo.username)
    const password = encodeURIComponent(env.mongo.password)

    const url = `mongodb://${username}:${password}@${host}:${port}?authMechanism=SCRAM-SHA-1`
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true })

    await client.connect()
    this.mongoDb = client.db(database)
  }
}
