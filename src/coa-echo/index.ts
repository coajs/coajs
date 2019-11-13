import * as colors from 'colors/safe'
import * as util from 'util'

const tty = process.stdout.isTTY

export default new class {
  log (message: any = '', ...optionalParams: any[]) {
    tty ? console.log(colors.black(util.format(message, ...optionalParams))) : console.log(message, ...optionalParams)
  }

  info (message: any = '', ...optionalParams: any[]) {
    tty ? console.log(colors.magenta(util.format(message, ...optionalParams))) : console.log(message, ...optionalParams)
  }

  error (message: any = '', ...optionalParams: any[]) {
    tty ? console.log(colors.red(util.format(message, ...optionalParams))) : console.log(message, ...optionalParams)
  }

  warn (message: any = '', ...optionalParams: any[]) {
    tty ? console.log(colors.yellow(util.format(message, ...optionalParams))) : console.log(message, ...optionalParams)
  }

  grey (message: any = '', ...optionalParams: any[]) {
    tty ? console.log(colors.gray(util.format(message, ...optionalParams))) : console.log(message, ...optionalParams)
  }

  green (message: any = '', ...optionalParams: any[]) {
    tty ? console.log(colors.green(util.format(message, ...optionalParams))) : console.log(message, ...optionalParams)
  }

  blue (message: any = '', ...optionalParams: any[]) {
    tty ? console.log(colors.blue(util.format(message, ...optionalParams))) : console.log(message, ...optionalParams)
  }

  cyan (message: any = '', ...optionalParams: any[]) {
    tty ? console.log(colors.cyan(util.format(message, ...optionalParams))) : console.log(message, ...optionalParams)
  }

  colors () {
    this.log('log black')
    this.warn('warn yellow')
    this.info('info magenta')
    this.error('error red')
    this.grey('grey')
    this.blue('blue')
    this.green('green')
    this.cyan('cyan')
  }
}