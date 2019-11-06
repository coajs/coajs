import { die, mongo } from '..'

const tableName = 'aac_uuid', nspId = 'ID:'

export default new class {

  async newNo (key1: string) {
    const data = await mongo.get().collection(tableName).findOneAndUpdate({ _id: nspId + key1 }, { $inc: { no: 1 } }, { upsert: true, returnOriginal: false })
    return data.value.no as number || die.hint('无法获取no')
  }

  async clearNo (key1: string) {
    await mongo.get().collection(tableName).deleteOne({ _id: nspId + key1 })
  }
}