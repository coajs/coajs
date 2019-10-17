import * as Koa from 'koa'
import ContextExtend from './context'

declare type TContextExtend = typeof ContextExtend;

export interface IContext extends TContextExtend, Koa.Context {}

export interface IContextExt extends IContext {}





