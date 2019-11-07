import * as knex from 'knex'
import { _, Dic, echo, mysql, uuid } from '..'

export type SafePartial<T> = T extends {} ? Partial<T> : any
export type Query = (qb: knex.QueryBuilder) => void
export type Transaction = knex.Transaction
export type Page = { rows: number, last: number }
export type ModelOption<T> = { key?: string, scheme: T, pick: string[], unpick?: string[], indexes?: string[] }

const DefaultPageRows = 20
const MaxPageRows = 1000

export class MysqlNative<Scheme> {

  protected readonly key: string
  protected readonly name: string
  protected readonly scheme: any
  protected readonly pick: string[]
  protected readonly indexes = [] as string[]
  protected readonly columns = [] as string[]
  protected readonly jsons = [] as string[]

  constructor (name: string, option: ModelOption<Scheme>) {
    // 处理基本数据
    this.scheme = option.scheme
    this.name = _.snakeCase(name)
    this.pick = option.pick
    this.indexes = option.indexes || []
    // 处理unpick
    const unpick = option.unpick || []
    unpick.forEach(u => delete (option.scheme as any)[u])
    // 处理columns
    _.forEach(this.scheme as any, (v, k: string) => {
      if (typeof v === 'object') this.jsons.push(k)
      this.columns.push(k)
    })
    this.key = option.key || this.columns[0]
  }

  private static checkPage (page: Page) {
    let last = page.last, rows = page.rows, more = false as boolean
    if (last < 0) last = 0
    if (rows < 1) rows = DefaultPageRows
    else if (rows > MaxPageRows) rows = MaxPageRows
    return { last, rows, more }
  }

  async insert (data: SafePartial<Scheme>, trx?: Transaction) {
    const time = _.now()
    const id = (data as any)[this.key] as string || await this.newId()
    const value = { [this.key]: id, created: time, updated: time, ...data }
    const a = await mysql(this.name).insert(this.fill(value, true))
    echo.log('a', a)

    return id
  }

  async mInsert (dataList: SafePartial<Scheme>[], trx?: Transaction) {
    const time = _.now()
    const values = [] as any[]
    const ids = [] as string[]
    for (const i in dataList) {
      const data = dataList[i] as any
      const id = data[this.key] || await this.newId()
      const value = { [this.key]: id, created: time, updated: time, ...data }
      values.push(this.fill(value, true))
      ids.push(id)
    }
    await this.table(trx).insert(values)
    return ids
  }

  async updateById (id: string, data: SafePartial<Scheme>, trx?: Transaction) {
    _.defaults(data, { updated: _.now() })
    const result = await this.table(trx).where({ [this.key]: id }).update(this.fill(data))
    return result || 0
  }

  async updateByIdQuery (id: string, query: Query, data: SafePartial<Scheme>, trx?: Transaction) {
    _.defaults(data, { updated: _.now() })
    const qb = this.table(trx).where({ [this.key]: id })
    query(qb)
    const result = await qb.update(this.fill(data))
    return result || 0
  }

  async upsertById (id: string, data: SafePartial<Scheme>, trx?: Transaction) {
    const time = _.now()
    _.defaults(data, { updated: time })
    const result = await this.table(trx).where({ [this.key]: id }).update(this.fill(data))
    if (result === 0) {
      _.defaults(data, { [this.key]: id, created: time })
      await this.table(trx).insert(data)
    }
    return result
  }

  async deleteByIds (ids: string[], trx?: Transaction) {
    const result = await this.table(trx).whereIn(this.key, ids).delete()
    return result || 0
  }

  async getById (id: string, pick = this.columns, trx?: Transaction) {
    const result = await this.table(trx).select(pick).where(this.key, id)
    return this.result(result[0], pick)
  }

  async mGetByIds (ids: string[], pick = this.pick, trx?: Transaction) {
    const result = {} as Dic<Scheme>
    pick.indexOf(this.key) < 0 && pick.unshift(this.key)
    const rows = await this.table(trx).select(pick).whereIn(this.key, ids)
    _.forEach(rows, (v: any) => {
      const key = v[this.key] as string
      result[key] = this.result(v, pick) as any
    })
    return result
  }

  async truncate (trx?: Transaction) {
    await this.table(trx).truncate()
  }

  protected async getIdBy (field: string, value: string | number, trx?: Transaction) {
    const result = await this.table(trx).select(this.key).where(field, value)
    const data = result[0] as Dic<string> || {}
    return data[this.key] || ''
  }

  protected table (trx?: Transaction) {
    const table = mysql<Scheme>(this.name)
    trx && table.transacting(trx)
    return table
  }

  protected async selectIdList (query: Query, trx?: Transaction) {
    const qb = this.table(trx).select([this.key])
    query(qb)
    return await qb as Scheme[]
  }

  protected async selectIdPageList (page: Page, query: Query, trx?: Transaction) {

    let { last, rows, more } = MysqlNative.checkPage(page)

    const qb = this.table(trx).select([this.key])
    qb.limit(rows + 1).offset(last)
    query(qb)
    const list = await qb as Scheme[]

    if (list.length === rows + 1) {
      list.pop()
      more = true
    } else
      rows = list.length
    last = last + rows

    return { list, page: { last, more, rows } }
  }

  protected async selectFirst (query: Query, pick = this.pick, trx?: Transaction) {
    const qb = this.table(trx).select(pick)
    query(qb)
    return await qb.first() as Scheme | null
  }

  protected async selectList (query: Query, pick = this.pick, trx?: Transaction) {
    const qb = this.table(trx).select(pick)
    query(qb)
    return await qb as Scheme[]
  }

  protected async count (query: Query, trx?: Transaction) {
    const qb = this.table(trx).count('id as count')
    query(qb)
    const ret = (await qb)[0] as Dic<number> || {}
    return ret.count || 0
  }

  protected async newId () {
    return await uuid.hexId()
  }

  protected result (data: any, pick: string[]) {
    if (data === null || data === undefined)
      return null
    // 处理json
    this.jsons.forEach(k => {
      if (data[k]) data[k] = JSON.parse(data[k])
    })
    // 处理默认值
    const result = {} as any
    pick.forEach(k => {
      result[k] = data.hasOwnProperty(k) ? data[k] : this.scheme[k]
    })
    return result as Scheme
  }

  protected fill<T> (data: T, insert = false) {
    const result = data as any
    // 当为insert的时候填满数据
    insert && _.defaults(data, this.scheme)
    // 处理json
    this.jsons.forEach(k => {
      if (typeof result[k] === 'object')
        result[k] = JSON.stringify(result[k])
    })
    return result as T
  }
}