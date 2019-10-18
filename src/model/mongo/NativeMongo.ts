import { Collection, Db, FilterQuery } from 'mongodb'
import { _, Dic, mongo, uuid } from '../..'
import lib, { TPOParam, TSchemeId, TSortParam } from './lib'

export class NativeMongo<Scheme> {

  protected collection: Collection<Partial<Scheme> | TSchemeId>
  protected mongoDb: Db

  private readonly key: string
  private readonly scheme: Scheme

  constructor (name: string, option: { key?: string, scheme: Scheme }) {
    this.key = option.key || _.camelCase(name) + 'Id'
    this.scheme = option.scheme
    this.mongoDb = mongo.get()
    this.collection = this.mongoDb.collection(_.snakeCase(name))
  }

  async insert (data: Partial<Scheme>) {
    const time = _.now()
    const _id = (data as any)[this.key] || await this.newId()
    const value = _.extend({ _id, [this.key]: _id, created: time, updated: time }, data)

    const result = await this.collection.insertOne(value)
    return result.insertedId as unknown as string
  }

  async mInsert (dataList: Partial<Scheme>[]) {
    const time = _.now()
    const values = [] as any[]
    for (const i in dataList) {
      const data = dataList[i] as any
      const _id = data[this.key] || await this.newId()
      values.push(_.extend({ _id, [this.key]: _id, created: time, updated: time }, data))
    }

    const result = await this.collection.insertMany(values)
    return _.values(result.insertedIds) as unknown as string[]
  }

  async updateById (_id: string, data: Partial<Scheme>) {
    _.defaults(data, { updated: _.now() })
    const result = await this.collection.updateOne({ _id }, { $set: data })
    return result.matchedCount
  }

  async saveById (_id: string, data: Partial<Scheme>) {
    data = _.extend({ _id, [this.key]: _id, updated: _.now() }, data)
    const result = await this.collection.updateOne({ _id }, { $set: data }, { upsert: true })
    return result.matchedCount
  }

  async replaceById (_id: string, data: Scheme) {
    data = _.extend({ _id, [this.key]: _id, updated: _.now() }, data)
    const result = await this.collection.replaceOne({ _id }, data, { upsert: true })
    return result.matchedCount
  }

  async deleteByIds (ids: string[]) {
    const result = await this.collection.deleteMany({ _id: { $in: ids } })
    return result.deletedCount || 0
  }

  async getById (_id: string, po?: TPOParam) {
    const result = await this.collection.findOne({ _id }, { projection: lib.po2project(po) })
    return this.fill(result, po)
  }

  async mGetByIds (ids: string[], po?: TPOParam) {
    const result = {} as Dic<Scheme>
    await this.collection.find({ _id: { $in: ids } }, { projection: lib.po2project(po, this.key) })
      .forEach((v: any) => result[v[this.key]] = this.fill(v, po) as any)
    return result
  }

  protected async list (option: { filter?: FilterQuery<Scheme>, sort?: TSortParam, po?: TPOParam } = {}) {
    const sort = option.sort || { _id: -1 }
    const result = [] as Scheme[]
    await this.collection.find(option.filter).sort(sort).project(lib.po2project(option.po))
      .forEach(v => result.push(this.fill(v, option.po) as any))
    return result
  }

  protected async one (filter: FilterQuery<Scheme>, po?: TPOParam) {
    const result = await this.collection.findOne(filter, { projection: lib.po2project(po) })
    return this.fill(result, po)
  }

  protected async count (filter: FilterQuery<Scheme> = {}) {
    return await this.collection.countDocuments(filter)
  }

  protected async newId () {
    return await uuid.hexId()
  }

  private fill (data: any, po: TPOParam = {}) {
    if (!data) return null
    data = _.defaultsDeep(data, this.scheme)
    const pick = po.pick || [], omit = po.omit || []
    if (pick.length) data = _.pick(data, pick)
    if (omit.length) data = _.omit(data, omit)
    return data as Scheme
  }

}