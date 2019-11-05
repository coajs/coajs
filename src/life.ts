import { mongo, uuid } from '.'

export default {
  async created () {
    await mongo.init()
    await uuid.init()
  },
  async started () {
  }
}
