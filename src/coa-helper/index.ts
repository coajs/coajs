import { _, BigNumber, dayjs, die } from '..'

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

  // 解析成数组，如果已经是数组则直接返回，不是数组则将值放在数组中
  parseArray<T> (data: any, defaults: T): any[] | T {
    return _.isArray(data) ? data : (data ? [data] : defaults)
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

  // 安全的异步遍历循环
  async asyncEachSafe (list: any, callback: (item: any, key: string | number) => void) {
    for (let i in list) {
      try {
        if (list.hasOwnProperty(i)) {
          await callback(list[i], i)
        }
      } catch (e) {
      }
    }
  }

  // 时间日期格式化
  datetime (format = 'YYYY-MM-DD HH:mm:ss', time ?: number) {
    // https://day.js.org/docs/zh-CN/display/format
    return dayjs(time).format(format)
  }

  // 计算平均值
  average (list: number[]) {
    if (list.length < 1) return 0

    let ave = new BigNumber(0)
    _.forEach(list, v => {
      ave = ave.plus(v)
    })
    ave = ave.div(list.length)
    return ave.dp(2).toNumber()
  }

  // 将所有键转换为camelCase风格
  camelCaseKeys (data: any) {
    if (_.isPlainObject(data)) {
      const result = {} as any
      _.forEach(data, (v, k) => {
        k = _.camelCase(k)
        v = this.camelCaseKeys(v)
        result[k] = v
      })
      return result
    } else if (_.isArray(data)) {
      return _.map(data, v => {
        v = this.camelCaseKeys(v)
        return v
      })
    } else
      return data
  }

  // 将所有键转换为snakeCase风格
  snakeCaseKeys (data: any) {
    if (_.isPlainObject(data)) {
      const result = {} as any
      _.forEach(data, (v, k) => {
        k = _.snakeCase(k)
        v = this.snakeCaseKeys(v)
        result[k] = v
      })
      return result
    } else if (_.isArray(data)) {
      return _.map(data, v => {
        v = this.snakeCaseKeys(v)
        return v
      })
    } else
      return data
  }

  // 判断汉字长度
  stringLength (str: string) {
    return str.replace(/[^\x00-\xff]/g, '01').length
  }
}