import { _, Dic } from '..'

declare type TList = any[];
declare type TWorkData = Dic<any>;
declare type TWorker = (ids: string[]) => Promise<TWorkData>

export default new class {

  // 扩展数据
  async extend (list: TList, worker: TWorker, key: string, extendKey: string, defaultValue = {}) {

    // 获取需要的ID列表
    const ids = [] as string[]
    _.forEach(list, v => {
      if (v && v[key]) ids.push(v[key])
    })

    // 如果数据不存在，直接返回
    if (ids.length < 1)
      return list

    // 根据ID列表通过worker获取数据
    const data = await worker(ids)

    // 遍历数据，将数据附加到list
    _.forEach(list, v => {
      if (v && v[key]) {
        const newData = data[v[key]] || defaultValue
        if (extendKey) v[extendKey] = newData
        else _.extend(v, newData)
      }
    })

    return list

  }

  // 扩展数组数据数据
  async extendArray (list: TList, worker: TWorker, dataKey: string, extendKey: string, defaultValue = {}) {

    // 获取需要的ID列表
    const ids = [] as string[]
    _.forEach(list, v => {
      if (v && v[dataKey] && v[dataKey].length)
        _.forEach(v[dataKey], v => ids.push(v))
    })

    // 如果数据不存在，直接返回
    if (ids.length < 1)
      return list

    // 根据ID列表通过worker获取数据
    const data = await worker(ids)

    // 遍历数据，将数据附加到list
    _.forEach(list, v => {
      if (v && v[dataKey] && v[dataKey].length) {
        const newArray = _.map(v[dataKey], v => data[v] || defaultValue)
        if (extendKey) v[extendKey] = newArray
        else v[dataKey] = newArray
      }
    })

    return list
  }
}
