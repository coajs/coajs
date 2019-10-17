import { Dic } from '../typings'
import initEnv from './init'
import initEnvExtend from './initExtend'

declare type TInitEnv = typeof initEnv
declare type TInitEnvExtend = typeof initEnvExtend

export interface IEnv extends TInitEnv, TInitEnvExtend, Dic<any> {}

export interface IEnvExt extends IEnv {}
