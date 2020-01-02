import { _, Dic } from '..'

declare type TWorkData = Dic<any>;
declare type TWorker = (ids: string[]) => Promise<TWorkData>

function getIds (list: any[], keys: string[]) {
  let ids = [] as string[]
  _.forEach(list, v => {
    if (typeof v === 'string')
      return ids.push(v)
    const item = _.get(v, keys[0]) as any
    if (typeof item === 'string')
      ids.push(item)
    else if (_.isArray(item))
      ids = _.concat(ids, getIds(item, keys.slice(1)))
  })
  return ids
}

function setValues (list: any, data: any, keys: string[], extend = '', value = {}) {
  const values = [] as any[]
  _.forEach(list, v => {
    if (typeof v === 'string')
      return values.push(data[v] || value)
    const item = _.get(v, keys[0]) as any
    if (typeof item === 'string') {
      const newData = data[item] || value
      extend ? _.set(v, extend, newData) : _.assign(v, newData)
    } else if (_.isArray(item)) {
      const newArray = setValues(item, data, keys.slice(1), extend, value)
      newArray.length && _.set(v, extend, newArray)
    }
  })
  return values
}

export default new class {

  // 扩展数据
  async extend (list: any[], key: string, extend = '', worker: TWorker, value = {}) {

    const keys = key.split('->')

    // 获取需要的ID列表
    const ids = getIds(list, keys)

    // 根据ID列表通过worker获取数据
    const data = ids.length < 1 ? {} : await worker(ids)

    // 遍历数据，将数据附加到list
    setValues(list, data, keys, extend, value)
  }
}
