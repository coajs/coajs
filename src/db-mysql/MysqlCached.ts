import { _, cache, DataSet, secure } from '..'
import { MysqlNative, Page, Query, SafePartial, Transaction } from './MysqlNative'

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

  protected pickResult<T> (data: T, pick: string[]) {
    if (!data) return null
    return _.pick(data, pick) as T
  }

  protected cacheNsp (nsp: string) {
    return this.name + ':' + nsp
  }

  protected cacheFinger (data: DataSet) {
    let arr = [] as string[]
    _.forEach(data, (v, k) => {
      if (typeof v === 'object') v = JSON.stringify(v)
      arr.push(k + '=' + v)
    })
    arr = arr.sort()
    return secure.sha1(arr.join('&'))
  }

  private async cacheChangeDataList (ids: string[], data?: SafePartial<Scheme>, trx?: Transaction) {
    let has = true
    const resultList = [] as SafePartial<Scheme>[]
    if (data) {
      has = _.some(this.indexes, i => !!(data as any)[i])
      resultList.push(data)
    }
    if (has) {
      const data = await this.mGetByIds(ids, this.columns, trx, 0)
      resultList.concat(_.values(data))
    }
    return resultList
  }

  private async cacheDeleteWork (ids: string[], dataList: SafePartial<Scheme>[]) {
    const deleteIds = [] as CacheDelete[]
    deleteIds.push([this.cacheNsp('id'), ids])
    deleteIds.push([this.cacheNsp('data'), []])
    this.indexes.forEach(i => {
      const ids = [] as string[]
      dataList.forEach(data => {
        const dataId = (data as any)[i] as string || ''
        dataId && ids.push(dataId)
      })
      ids.length && deleteIds.push([this.cacheNsp(i), ids])
    })
    await cache.mDelete(deleteIds)
  }
}