import { _, Dic } from '..'

declare type TWorkData = Dic<any>;
declare type TWorker = (ids: string[]) => Promise<TWorkData>

export default new class {

  // 扩展数据
  async extend (list: any[], key: string, extend = '', worker: TWorker, value = {}) {

    // 获取需要的ID列表
    const ids = [] as string[]
    _.forEach(list, v => {
      const id = _.get(v, key)
      if (!id) return
      if (_.isArray(id)) id.forEach(i => ids.push(i))
      else ids.push(id)
    })

    // 根据ID列表通过worker获取数据
    const data = ids.length < 1 ? {} : await worker(ids)

    // 遍历数据，将数据附加到list
    _.forEach(list, v => {
      const id = _.get(v, key)
      if (_.isArray(id)) {
        const newArray = id.map(v => data[v] || value)
        _.set(v, extend, newArray)
      } else {
        const newData = data[id] || value
        extend ? _.set(v, extend, newData) : _.assign(v, newData)
      }
    })
  }
}
