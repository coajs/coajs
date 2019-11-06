import { _, die, moment } from '..'

export default new class {

  // try但不报错
  try<T> (work: () => T) {
    try {
      return work()
    } catch (e) {}
  }

  // 判断是否在数组中
  inArray (list: any[], value: any) {
    return _.indexOf(list, value) > -1
  }

  // 校验并返回处理后的参数
  checkParam<T> (id: string, value: T, data: any, required: boolean, title?: string) {

    required && !data && die.hint(`缺少${title || id}参数`)
    const invalid = () => required ? die.hint(`参数${title || id}有误`) : value

    const type = typeof value as string
    if (type === 'string') {
      data = _.toString(data) || invalid()
    } else if (type === 'number' || type === 'bigint') {
      data = _.toNumber(data) || invalid()
    } else if (type === 'boolean') {
      data = _.isBoolean(data) ? !!data : invalid()
    } else if (type === 'object') {
      if (_.isArray(value)) {
        data = _.isArray(data) ? data : (data ? [data] : invalid())
      } else {
        data = _.isObject(data) ? data : invalid()
      }
    }
    return data as T
  }

  // 延迟执行函数
  async timeout (ms: number = 0) {
    return new Promise(resolve => {
      setTimeout(() => resolve(), ms)
    })
  }

  // 列表转换成树形式
  list2tree (list: any[], rootValue: any = '', idKey = 'id', pidKey = 'parentId', childKey = 'child') {
    const temp = {} as any, tree = [] as any[]
    list.forEach(item => {
      temp[item[idKey]] = item
    })
    list.forEach(item => {
      if (item[pidKey] === rootValue)
        tree.push(temp[item[idKey]])
      else if (temp[item[pidKey]]) {
        temp[item[pidKey]][childKey] = temp[item[pidKey]][childKey] || []
        temp[item[pidKey]][childKey].push(temp[item[idKey]])
      }
    })
    return tree
  }

  // 列表转成对象形式
  list2object<T> (list: T[], key = 'id') {
    const temp = {} as { [s: string]: T }
    list.forEach((item: any) => {
      const id = item[key] || false
      if (id) temp[id] = item
    })
    return temp
  }

  // 异步遍历循环
  async asyncEach (list: any, callback: (item: any, key: string | number) => void) {
    for (let i in list)
      if (list.hasOwnProperty(i))
        await callback(list[i], i)
  }

  // 时间日期格式化
  datetime (format = 'YYYY-MM-DD HH:mm:ss', time ?: number) {
    // http://momentjs.com/docs/#/displaying/
    return moment(time || new Date()).format(format)
  }
}