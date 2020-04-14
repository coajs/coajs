import * as fs from 'fs'
import { Dic } from '..'

// 处理基本信息
const env = process.env || {}
const runEnv = env.RUN_ENV || 'd0'
const runEnvType = runEnv.substr(0, 1) as 'd' | 't' | 'v'
const envNames = { d: 'alpha', t: 'beta', v: 'online' } as Dic<'alpha' | 'beta' | 'online'>

// 构建
export const env_build_in = {
  env,
  runEnv,
  runEnvType,
  runEnvName: envNames[runEnvType] || 'unknown',
  cwd: process.cwd(),
  name: env.npm_package_name || '',
  isProd: env.NODE_ENV === 'production',
  isOnline: runEnvType === 'v',
  hostname: env.HOSTNAME || 'local',
  version: env.npm_package_version || '',
  mods: {} as Dic<boolean>,
  started: false,
}

// 处理version
try {
  env_build_in.version = fs.readFileSync('static/version', { encoding: 'utf8' }).split('\n')[0]
} catch (e) {}

// 处理mods
const modules = env.MODS || env.MODULES || ''
modules.split(',').forEach(v => env_build_in.mods[v] = !!v)