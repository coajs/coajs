import initEnv from './init'
import initEnvDefault from './initDefault'

declare type InitEnv = typeof initEnv
declare type InitEnvDefault = typeof initEnvDefault

export interface Env extends InitEnv, InitEnvDefault {}

export interface EnvExt extends Env {}