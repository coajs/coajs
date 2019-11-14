import { _, MysqlCached } from '..'

const scheme = {
  key: '' as string,
  value: [] as any[],
  expire: 0 as number,
}
const pick = ['key', 'value', 'expire']

export default new class extends MysqlCached<typeof scheme> {

  constructor () {
    super('AacStorage', { scheme, pick })
  }

  async get<T> (key: string, default_value: T) {
    const { expire, value } = await super.getById(key) || { expire: -1, value: null }
    if (expire !== 0 && expire < _.now()) return default_value
    return value as T | null
  }

  async set (key: string, value: any, ms = 0) {
    const expire = ms <= 0 ? 0 : ms + _.now()
    return await super.upsertById(key, { key, value, expire })
  }

  define = <T> (key: string, default_value: T, _ms = 0) => ({
    get: () => this.get(key, default_value),
    set: (value: T, ms = _ms) => this.set(key, value, ms),
  })
}