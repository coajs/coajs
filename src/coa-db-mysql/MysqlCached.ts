import { _, cache, DataSet, Dic, die, MysqlNative, secure } from '..'
import { Page, Query, SafePartial, Transaction } from './typings'

export class MysqlCached<Scheme> extends MysqlNative<Scheme> {

  async insert (data: SafePartial<Scheme>, trx?: Transaction) {
    const id = await super.insert(data, trx)
    await this.cacheDeleteWork([id], [data])
    return id
  }

  async mInsert (dataList: SafePartial<Scheme>[], trx?: Transaction) {
    const ids = await super.mInsert(dataList, trx)
    await this.cacheDeleteWork(ids, dataList)
    return ids
  }

  async updateById (id: string, data: SafePartial<Scheme>, trx?: Transaction) {
    const dataList = await this.cacheChangeDataList([id], data, trx)
    const result = await super.updateById(id, data, trx)
    if (result)
      await this.cacheDeleteWork([id], dataList)
    return result
  }

  async updateByIdQuery (id: string, query: Query, data: SafePartial<Scheme>, trx?: Transaction) {
    const dataList = await this.cacheChangeDataList([id], data, trx)
    const result = await super.updateByIdQuery(id, query, data, trx)
    if (result)
      await this.cacheDeleteWork([id], dataList)
    return result
  }

  async upsertById (id: string, data: SafePartial<Scheme>, trx?: Transaction) {
    const dataList = await this.cacheChangeDataList([id], data, trx)
    const result = await super.upsertById(id, data, trx)
    await this.cacheDeleteWork([id], dataList)
    return result
  }

  async deleteByIds (ids: string[], trx?: Transaction) {
    const dataList = await this.cacheChangeDataList(ids, undefined, trx)
    const result = await super.deleteByIds(ids, trx)
    if (result)
      await this.cacheDeleteWork(ids, dataList)
    return result
  }

  async checkById (id: string, pick = this.columns, trx?: Transaction, ms?: number) {
    return await this.getById(id, pick, trx, ms) || die.hint(`${this.title || this.name}不存在`)
  }

  async getById (id: string, pick = this.columns, trx?: Transaction, ms?: number) {
    const result = await cache.warp(this.cacheNsp('id'), id, () => super.getById(id, this.columns, trx), ms)
    return this.pickResult(result, pick)
  }

  async getBy (field: string, value: string | number, pick = this.columns, trx?: Transaction) {
    const id = await this.getIdBy(field, value, trx)
    return id ? await this.getById(id, pick) : null
  }

  async getIdBy (field: string, value: string | number, trx?: Transaction) {
    return await cache.warp(this.cacheNsp(field), '' + value, () => super.getIdBy(field, value, trx))
  }

  async mGetByIds (ids: string[], pick = this.pick, trx?: Transaction, ms?: number) {
    const result = await cache.mWarp(this.cacheNsp('id'), ids, ids => super.mGetByIds(ids, this.columns, trx), ms)
    _.forEach(result, (v, k) => result[k] = this.pickResult(v, pick))
    return result
  }

  async truncate (trx?: Transaction) {
    await super.truncate(trx)
    await this.cacheDeleteWork([], [])
  }

  protected async findIdList (finger: string, query: Query, trx?: Transaction) {
    const cacheId = 'list:' + finger
    return await cache.warp(this.cacheNsp('data'), cacheId, () => super.selectIdList(query, trx))
  }

  protected async findIdPageList (finger: string, page: Page, query: Query, trx?: Transaction) {
    const cacheId = `page:${page.rows}:${page.last}:` + finger
    return await cache.warp(this.cacheNsp('data'), cacheId, () => super.selectIdPageList(page, query, trx))
  }

  protected async mGetCountBy (field: string, ids: string[], trx?: Transaction) {
    return await cache.mWarp(this.cacheNsp('count', field), ids, async ids => {
      const rows = await this.table(trx).select(`${field} as id`).count(`${this.key} as count`).whereIn(field, ids).groupBy(field) as any[]
      const result = {} as Dic<number>
      _.forEach(rows, ({ id, count }) => result[id] = count)
      return result
    })
  }

  protected async getCountBy (field: string, value: string, query?: Query, trx?: Transaction) {
    return await cache.warp(this.cacheNsp('count', field), value, async () => {
      const qb = this.table(trx).count(`${this.key} as count`)
      typeof query === 'function' ? query(qb) : qb.where(field, value)
      const rows = await qb
      const { count } = rows[0] as any || {}
      return count || 0
    })
  }

  protected pickResult<T> (data: T, pick: string[]) {
    if (!data) return null
    return _.pick(data, pick) as T
  }

  protected cacheNsp (...nsp: string[]) {
    return this.name + ':' + nsp.join(':')
  }

  protected cacheFinger (data: DataSet, ...data2: DataSet[]) {
    let arr1 = [] as string[], arr2 = [] as string[]
    _.forEach(_.pickBy(data), (v, k) => {
      const val = typeof v === 'object' ? JSON.stringify(v) : v
      arr1.push(k + '=' + val)
    })
    arr1 = arr1.sort()
    _.forEach(data2, data => {
      _.forEach(_.pickBy(data), (v, k) => {
        const val = typeof v === 'object' ? JSON.stringify(v) : v
        arr2.push(k + '=' + val)
      })
    })
    arr2 = arr2.sort()
    const str = arr1.join('&') + '&' + arr2.join('&')
    return secure.sha1(str)
  }

  private async cacheChangeDataList (ids: string[], data?: SafePartial<Scheme>, trx?: Transaction) {
    let has = true
    const resultList = [] as SafePartial<Scheme>[]
    if (data) {
      has = _.some(this.cachesFields, i => !!(data as any)[i])
      resultList.push(data)
    }
    if (has) {
      const data = await this.mGetByIds(ids, this.columns, trx, 0)
      resultList.push(..._.values(data))
    }
    return resultList
  }

  private async cacheDeleteWork (ids: string[], dataList: SafePartial<Scheme>[]) {
    const deleteIds = [] as CacheDelete[]
    deleteIds.push([this.cacheNsp('id'), ids])
    deleteIds.push([this.cacheNsp('data'), []])
    this.caches.index.forEach(i => {
      const ids = [] as string[]
      dataList.forEach(data => {
        const dataId = (data as any)[i] as string || ''
        dataId && ids.push(dataId)
      })
      ids.length && deleteIds.push([this.cacheNsp(i), ids])
    })
    this.caches.count.forEach(i => {
      const ids = [] as string[]
      const keys = i.split(/[:,]/)
      const key = keys[0]
      dataList.forEach(data => {
        const dataId = (data as any)[key] as string || ''
        dataId && ids.push(dataId)
      })
      keys.slice(1).forEach(k => ids.push(k))
      ids.length && deleteIds.push([this.cacheNsp('count', key), ids])
    })
    await cache.mDelete(deleteIds)
  }
}
