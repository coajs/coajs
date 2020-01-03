import { _, Dic } from '..'

declare type TWorkData = Dic<any>;
declare type TWorker = (ids: string[]) => Promise<TWorkData>

function getIds (list: any[], keys: string[]) {
  const key = keys[0] || ''
  const ids = [] as string[]
  if (key) _.forEach(list, v => {
    const item = _.get(v, key) as any
    if (typeof item === 'string')
      ids.push(item)
    else if (_.isArray(item))
      ids.push(...getIds(item, keys.slice(1)))
  })
  else _.forEach(list, v => {
    if (typeof v === 'string') ids.push(v)
  })
  return ids
}

function setValues (list: any, data: any, keys: string[], extend = '', value = {}) {
  const key = keys[0] || ''
  const values = [] as any[]
  if (key) _.forEach(list, v => {
    const item = _.get(v, key) as any
    if (typeof item === 'string') {
      const new_data = data[item] || value
      extend ? _.set(v, extend, new_data) : _.assign(v, new_data)
    } else if (_.isArray(item)) {
      const new_array = setValues(item, data, keys.slice(1), extend, value)
      new_array.length && _.set(v, extend, new_array)
    }
  })
  else _.forEach(list, v => {
    if (typeof v === 'string') values.push(data[v] || value)
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
