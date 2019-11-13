import { Dic } from '../typings'
import initEnv from './init'
import initEnvDefault from './initDefault'

declare type InitEnv = typeof initEnv
declare type InitEnvDefault = typeof initEnvDefault

export interface Env extends InitEnv, InitEnvDefault, Dic<any> {}

export interface EnvExt extends Env {}