import { Dic } from '../typings'

const env = process.env
const cwd = process.cwd()
const isDev = process.env.NODE_ENV !== 'production'
const runEnv = env.RUN_ENV || 'd0'
const hostname = env.HOSTNAME || 'local'
const name = env.npm_package_name || ''
const version = env.npm_package_version || ''
const license = env.npm_package_license || ''

const runEnvName = runEnv
  .replace(/d\d/, 'Alpha')
  .replace(/t\d/, 'Beta')
  .replace(/v\d/, 'Release')

const mods = {} as Dic<boolean>
const modules = env.MODS || env.MODULES || ''
modules.split(',').forEach(v => mods[v] = !!v)

export default { cwd, isDev, runEnv, runEnvName, hostname, name, version, license, mods }
