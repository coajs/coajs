import { uuid } from '.'

export default new class {

  onAppCreated = () => {}
  onAppStarted = () => {}
  onAppTimer = () => {}

  async onCreated () {
    await uuid.init()
    await this.onAppCreated()
  }

  async onStarted () {
    await this.onAppStarted()
  }

  async onTimer () {
    await this.onAppTimer()
  }
}
