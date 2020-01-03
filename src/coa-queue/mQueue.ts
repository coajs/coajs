import { mysql, MysqlNative, Query } from '..'

const scheme = {
  queueId: '',
  name: '',
  data: {} as any,
  reason: '',
  times: 0,
  maxTimes: 0,
  status: 1,
}
const pick = ['queueId', 'name', 'data', 'times']

export default new class extends MysqlNative<typeof scheme> {

  constructor () {
    super({ name: 'AacQueue', scheme, pick })
  }

  async pop () {

    const query: Query = qb => {
      qb.whereRaw('times <= maxTimes')
      qb.orderBy('times', 'asc').orderBy('created', 'asc')
      qb.forUpdate()
    }

    return await mysql.transaction(async trx => {
      const result = await this.selectFirst(query, pick, trx)
      if (result) {
        result.times++
        await this.updateById(result.queueId, { times: result.times }, trx)
      }
      return result
    })
  }
}
