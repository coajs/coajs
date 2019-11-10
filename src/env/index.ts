import { _, Env } from '..'
import initEnv from './init'
import initExtend from './initExtend'

let defaultEnv = {}, envEnv = {}

try {
  defaultEnv = require('env/' + '0').default
} catch (e) {}
try {
  envEnv = require('env/' + initEnv.runEnv).default
} catch (e) {}

export default _.defaultsDeep(envEnv, defaultEnv, initExtend, initEnv) as Env
