import { _, env, mysql } from '..'

const tableName = 'aac_uuid'

export default new class {

  async newNo (key1: string) {
    if (!env.mysql.host) return 0
    return await mysql.transaction(async trx => {
      const id = key1
      const data = await trx(tableName).first('no').where({ id }).forUpdate() || {}
      const no = _.toInteger(data.no) + 1
      if (no === 1) await trx(tableName).insert({ id, no })
      else await trx(tableName).update({ no }).where({ id })
      return no
    })
  }

  async clearNo (key1: string) {
    await mysql(tableName).delete().where({ id: key1 })
  }

}