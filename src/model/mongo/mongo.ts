import { Db, MongoClient } from 'mongodb'
import { env } from '../../index'

export default new class {

  private mongoDb = {} as Db

  get () {
    return this.mongoDb
  }

  async init () {
    const host = env.mongo.host
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
