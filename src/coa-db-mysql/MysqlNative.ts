import { _, Dic, mysql, uuid } from '..'
import { ModelOption, Page, Query, SafePartial, Transaction } from './typings'

const DefaultPageRows = 20
const MaxPageRows = 1000

export class MysqlNative<Scheme> {

  protected readonly key: string
  protected readonly name: string
  protected readonly title: string
  protected readonly prefix: string
  protected readonly scheme: any
  protected readonly pick: string[]
  protected readonly caches = {} as { index: string[], count: string[], [name: string]: string[] }
  protected readonly cachesFields = [] as string[]
  protected readonly columns = [] as string[]
  protected readonly jsons = [] as string[]

  constructor (option: ModelOption<Scheme>) {
    // 处理基本数据
    this.scheme = option.scheme
    this.name = _.snakeCase(option.name)
    this.title = option.title || ''
    this.prefix = option.prefix || ''
    this.pick = option.pick
    this.caches = _.defaults(option.caches, { index: [], count: [] })
    // 将需要用到缓存的字段单独记录为一个数组，方便判断是否需要处理缓存
    _.forEach(this.caches, items => items.forEach(item => {
      const field = item.split(/[:,]/)[0]
      this.cachesFields.indexOf(field) < 0 && this.cachesFields.push(field)
    }))
    // 处理unpick
    const unpick = option.unpick || []
    unpick.forEach(u => delete (option.scheme as any)[u])
    // 处理columns
    _.forEach(this.scheme as any, (v, k: string) => {
      if (typeof v === 'object') this.jsons.push(k)
      this.columns.push(k)
    })
    // 设置第一个column值为主键
    this.key = option.key || this.columns[0]
  }

  // 检查分页参数
  private static checkPage (page: Page) {
    let last = page.last, rows = page.rows, more = false as boolean
    if (last < 0) last = 0
    if (rows < 1) rows = DefaultPageRows
    else if (rows > MaxPageRows) rows = MaxPageRows
    return { last, rows, more }
  }

  // 插入
  async insert (data: SafePartial<Scheme>, trx?: Transaction) {
    // 设置主键ID
    const id = (data as any)[this.key] as string || await this.newId()
    // 设置时间数据
    const time = _.now()
    const value = { [this.key]: id, created: time, updated: time, ...data }
    // 新增数据
    await this.table(trx).insert(this.fill(value, true))
    return id
  }

  // 批量插入
  async mInsert (dataList: SafePartial<Scheme>[], trx?: Transaction) {
    const time = _.now()
    const values = [] as any[]
    const ids = [] as string[]
    for (const i in dataList) {
      const data = dataList[i] as any
      // 设置主键ID
      const id = data[this.key] || await this.newId()
      // 设置时间数据
      const value = { [this.key]: id, created: time, updated: time, ...data }
      values.push(this.fill(value, true))
      ids.push(id)
    }
    await this.table(trx).insert(values)
    return ids
  }

  // 通过ID更新
  async updateById (id: string, data: SafePartial<Scheme>, trx?: Transaction) {
    _.defaults(data, { updated: _.now() })
    const result = await this.table(trx).where({ [this.key]: id }).update(this.fill(data))
    return result || 0
  }

  // 通过查询条件更新
  async updateByIdQuery (id: string, query: Query, data: SafePartial<Scheme>, trx?: Transaction) {
    _.defaults(data, { updated: _.now() })
    const qb = this.table(trx).where({ [this.key]: id })
    query(qb)
    const result = await qb.update(this.fill(data))
    return result || 0
  }

  // 通过ID更新或插入
  async upsertById (id: string, data: SafePartial<Scheme>, trx?: Transaction) {
    const time = _.now()
    _.defaults(data, { updated: time })
    const result = await this.table(trx).where({ [this.key]: id }).update(this.fill(data))
    if (result === 0) {
      _.defaults(data, { [this.key]: id, created: time })
      await this.table(trx).insert(this.fill(data, true))
    }
    return result
  }

  // 通过ID删除多个
  async deleteByIds (ids: string[], trx?: Transaction) {
    const result = await this.table(trx).whereIn(this.key, ids).delete()
    return result || 0
  }

  // 通过ID获取一个
  async getById (id: string, pick = this.columns, trx?: Transaction) {
    const result = await this.table(trx).select(pick).where(this.key, id)
    return this.result(result[0], pick)
  }

  // 通过ID获取多个
  async mGetByIds (ids: string[], pick = this.pick, trx?: Transaction) {
    const result = {} as Dic<Scheme>
    pick.indexOf(this.key) < 0 && pick.unshift(this.key)
    const rows = await this.table(trx).select(pick).whereIn(this.key, ids)
    rows.forEach((v: any) => {
      const key = v[this.key] as string
      result[key] = this.result(v, pick) as any
    })
    ids.forEach(id => {
      if (!result.hasOwnProperty(id)) result[id] = null as any
    })
    return result
  }

  // 截断表
  async truncate (trx?: Transaction) {
    await this.table(trx).truncate()
  }

  // 获取table对象
  table (trx?: Transaction) {
    const table = mysql<Scheme>(this.name)
    trx && table.transacting(trx)
    return table
  }

  // 通过某个字段查询ID
  protected async getIdBy (field: string, value: string | number, trx?: Transaction) {
    const result = await this.table(trx).select(this.key).where(field, value)
    const data = result[0] as Dic<string> || {}
    return data[this.key] || ''
  }

  // 查询ID格式全部列表
  protected async selectIdList (query: Query, trx?: Transaction) {
    const qb = this.table(trx).select(this.name + '.' + this.key)
    query(qb)
    qb.orderBy(this.name + '.id', 'desc')
    return await qb as Scheme[]
  }

  // 查询ID格式分页列表
  protected async selectIdPageList (page: Page, query: Query, trx?: Transaction) {

    let { last, rows, more } = MysqlNative.checkPage(page)

    const qb = this.table(trx).select(this.name + '.' + this.key)
    query(qb)
    qb.limit(rows + 1).offset(last)
    qb.orderBy(this.name + '.id', 'desc')
    const list = await qb as Scheme[]

    if (list.length === rows + 1) {
      list.pop()
      more = true
    } else
      rows = list.length
    last = last + rows

    return { list, page: { last, more, rows } }
  }

  // 查询第一条数据
  protected async selectFirst (query: Query, pick = this.pick, trx?: Transaction) {
    const qb = this.table(trx).select(pick)
    query(qb)
    qb.orderBy(this.name + '.id', 'desc')
    const first = await qb.first()
    return this.result(first, pick)
  }

  // 查询列表
  protected async selectList (query: Query, pick = this.pick, trx?: Transaction) {
    const qb = this.table(trx).select(pick)
    query(qb)
    qb.orderBy(this.name + '.id', 'desc')
    const list = await qb
    return list.map(v => this.result(v, pick) as Scheme) || []
  }

  // 计数
  protected async count (query: Query, trx?: Transaction) {
    const qb = this.table(trx).count({ result: this.name + '.id' })
    query(qb)
    const ret = (await qb)[0] || {}
    return ret.result || 0
  }

  // 获取ID
  protected async newId () {
    return this.prefix + await uuid.hexId()
  }

  // 从数据库获取之后补全数据
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

  // 更新和插入数据库之前处理数据
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
