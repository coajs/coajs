import { Dic } from '../typings'
import initEnv from './init'
import initEnvExtend from './initExtend'

declare type InitEnv = typeof initEnv
declare type InitEnvExtend = typeof initEnvExtend

export interface Env extends InitEnv, InitEnvExtend, Dic<any> {}

export interface EnvExt extends Env {}