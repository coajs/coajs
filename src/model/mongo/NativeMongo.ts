import { Collection, Db, FilterQuery, FindOneOptions, UpdateOneOptions, UpdateQuery } from 'mongodb'
import { _, Dic, mongo, uuid } from '../..'

export declare type TSort = Dic<number>
export declare type TSchemeExt = { _id: string, created: number, updated: number }

export class NativeMongo<Scheme> {

  private readonly key: string
  private readonly name: string
  private readonly scheme: Scheme
  private readonly pick: string[]
  private readonly columns: string[]

  constructor (name: string, option: { key?: string, scheme: Scheme, pick: string[], unpick?: string[] }) {
    // 处理基本数据
    this.key = option.key || _.camelCase(name) + 'Id'
    this.scheme = option.scheme
    this.name = name
    this.pick = option.pick
    // 处理unpick
    const unpick = option.unpick || []
    unpick.forEach(u => delete (option.scheme as any)[u])
    // 处理columns
    this.columns = Object.keys(option.scheme)
  }

  private _db: any

  protected get db (): Db {
    if (!this._db)
      this._db = mongo.get()
    return this._db
  }

  private _collection: any

  protected get collection (): Collection<Partial<Scheme> | TSchemeExt> {
    if (!this._collection)
      this._collection = this.db.collection(_.snakeCase(this.name))
    return this._collection
  }

  async insert (data: Partial<Scheme>) {
    const time = _.now()
    const _id = (data as any)[this.key] || await this.newId()
    const value = { _id, [this.key]: _id, created: time, updated: time, ...data }
    const result = await this.collection.insertOne(value)
    return result.insertedId as unknown as string
  }

  async mInsert (dataList: Partial<Scheme>[]) {
    const time = _.now()
    const values = [] as any[]
    for (const i in dataList) {
      const data = dataList[i] as any
      const _id = data[this.key] || await this.newId()
      const value = { _id, [this.key]: _id, created: time, updated: time, ...data }
      values.push(value)
    }
    const result = await this.collection.insertMany(values)
    return _.values(result.insertedIds) as unknown as string[]
  }

  async updateById (id: string, set: Partial<Scheme>, update: UpdateQuery<Scheme> = {}, options?: UpdateOneOptions) {
    const dataUpdate = { ...update, $set: { updated: _.now(), ...set } }
    const result = await this.collection.updateOne({ _id: id }, dataUpdate, options)
    return result.matchedCount
  }

  async deleteByIds (ids: string[]) {
    const result = await this.collection.deleteMany({ _id: { $in: ids } })
    return result.deletedCount || 0
  }

  async getById (id: string, pick = this.columns, options: FindOneOptions = {}) {
    options.projection = this.projection(pick)
    const result = await this.collection.findOne({ _id: id }, options)
    return this.result(result, pick)
  }

  async mGetByIds (ids: string[], pick = this.pick, options: FindOneOptions = {}) {
    const result = {} as Dic<Scheme>
    options.projection = this.projection(pick)
    await this.collection.find({ _id: { $in: ids } }, options)
      .forEach(v => result[(v as any)[this.key]] = this.result(v, pick))
    return result
  }

  protected async findIdList (query: FilterQuery<Scheme>, sort: TSort = {}, options: FindOneOptions = {}) {
    const result = [] as Scheme[]
    options.projection = { _id: 0, [this.key]: 1 }
    _.defaults(sort, { created: -1 })
    await this.collection.find(query, options).sort(sort)
      .forEach(v => result.push(v as any))
    return result
  }

  protected async findList (query: FilterQuery<Scheme>, pick = this.columns, sort: TSort = {}, options: FindOneOptions = {}) {
    const result = [] as Scheme[]
    options.projection = this.projection(pick)
    _.defaults(sort, { created: -1 })
    await this.collection.find(query, options).sort(sort)
      .forEach(v => result.push(this.result(v, pick) as any))
    return result
  }

  protected async find (query: FilterQuery<Scheme>, pick: string[] = this.columns, options: FindOneOptions = {}) {
    options.projection = this.projection(pick)
    const result = await this.collection.findOne(query, options)
    return this.result(result, pick)
  }

  protected async count (query: FilterQuery<Scheme> = {}) {
    return await this.collection.countDocuments(query)
  }

  protected async newId () {
    return await uuid.hexId()
  }

  private projection (pick: string[]) {
    const result = { _id: 0, [this.key]: 1 }
    _.forEach(pick, v => result[v] = 1)
    return result
  }

  private result (data: any, pick: string[]) {
    _.defaultsDeep(data, this.scheme)
    return _.pick(data, pick) as Scheme
  }

}