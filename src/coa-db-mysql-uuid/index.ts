import HashIds from 'hashids'
import { _, uuid } from '..'
import bin from './bin'

const hexIds = new HashIds('UUID-HEX', 16, '0123456789abcdef')
const hashIds = new HashIds('UUID-HASH', 12, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')
const store = { key1: 0, key2: 0, key3: 0, lock: false }
const nspDuration = 24 * 3600 * 1000, nspId = 'ID:', maxIndex = 9990

export default new class {

  async init () {
    // 如果已经在执行，就忽略
    if (store.lock)
      return
    store.lock = true
    const [key1, key2, key3] = await this.newKeys()
    store.key1 = key1
    store.key2 = key2
    store.key3 = key3
    store.lock = false
  }

  async series (nsp: string) {
    return await bin.newNo(nsp)
  }

  async saltId () {
    // 预保存数据
    const result = [store.key1, store.key2, ++store.key3]
    // 某些时机下会异步更新
    if (store.key3 > maxIndex || store.key1 !== this.getKey1()) {
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

  protected getKey1 () {
    return _.toInteger(_.now() / nspDuration)
  }

  private async newKeys () {
    const key1 = this.getKey1()
    const key2 = await this.newNo(key1)
    if (key2 === 1)
      await this.clearNo(key1 - 3)
    return [key1, key2, 0]
  }

  private async newNo (key1: number) {
    return await bin.newNo(nspId + key1)
  }

  private async clearNo (key1: number) {
    await bin.clearNo(nspId + key1)
  }

}