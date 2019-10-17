import HashIds from 'hashids'
import { _, die, mongo, uuid } from '..'

const hexIds = new HashIds('UUID-HEX', 16, '0123456789abcdef')
const hashIds = new HashIds('UUID-HASH', 12, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')
const store = { day: 0, series: 0, index: 0, lock: false }
const colName = 'uuid', nspId = 'ID:', nspDuration = 24 * 3600 * 1000, maxIndex = 9990

export default new class {

  async init () {
    // 如果已经在执行，就忽略
    if (store.lock)
      return
    store.lock = true
    const day = this.getDay()
    const col = mongo.get().collection(colName)
    const data = await col.findOneAndUpdate({ _id: nspId + day }, { $inc: { series: 1 } }, { upsert: true, returnOriginal: false })
    store.series = data.value.series as number || die.hint('无法获取series')
    store.day = day
    store.index = 0
    // 清除超过三天的数据记录
    if (store.series === 1) {
      const deleteDay = day - 3
      col.deleteOne({ _id: nspId + deleteDay }).then()
    }
    store.lock = false
  }

  async seriesNo (nsp: string, step = 1) {
    const col = mongo.get().collection('uuid')
    const data = await col.findOneAndUpdate({ _id: nsp }, { $inc: { series: step } }, { upsert: true, returnOriginal: false })
    return data.value.series as number || die.hint('无法获取series')
  }

  async saltId () {
    // 预保存数据
    const result = [store.day, store.series, ++store.index]
    // 某些时机下会异步更新
    if (store.index > maxIndex || store.day !== this.getDay()) {
      uuid.init().then()
    }
    // 返回结果
    return result
  }

  async hexId () {
    const saltId = await this.saltId()
    return hexIds.encode(saltId)
  }

  async hashId () {
    const saltId = await this.saltId()
    return hashIds.encode(saltId)
  }

  private getDay () {
    return _.toInteger(_.now() / nspDuration)
  }

}