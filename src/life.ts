import { uuid } from '.'

export default {
  async created () {
    await uuid.init()
  },
  async started () {
  }
}
