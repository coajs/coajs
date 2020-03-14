import { _, env, mysql } from '..'

const tableName = 'aac_uuid'

export default new class {

  // 生成新的唯一顺序码
  async newNo (nsp: string, key: string | number) {
    if (!env.mysql.host) return 0
    return await mysql.transaction(async trx => {
      const id = nsp + key
      const data = await trx(tableName).first('no').where({ id }).forUpdate() || {}
      const no = _.toInteger(data.no) + 1
      if (no === 1)
        await trx(tableName).insert({ id, no })
      else
        await trx(tableName).update({ no }).where({ id })
      return no
    })
  }

  // 清除无用的数据
  async clearUseless (nsp: string, key: string | number) {
    return mysql(tableName).delete()
      .where('id', 'LIKE', nsp + '%')
      .where('id', '<', nsp + key)
  }

}