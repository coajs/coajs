import { _, Env } from '..'
import { env_build_in } from './env_build_in'
import { env_example } from './env_example'

let env_0 = {}, env_1 = {}

try {
  env_0 = require('env/' + '0').default
} catch (e) {}
try {
  env_1 = require('env/' + env_build_in.runEnv).default
} catch (e) {}

export default _.defaultsDeep(env_1, env_0, env_example, env_build_in) as Env
