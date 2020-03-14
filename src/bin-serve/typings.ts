import * as Koa from 'koa'
import { Dic } from '..'
import contextExtend from './context'

declare type ContextExtend = typeof contextExtend;

declare module 'koa' {
  interface Request {
    body?: any;
    rawBody: string;
  }
}

export interface Context extends ContextExtend, Koa.Context {
  params: { [index: string]: string },
}

export interface ContextExt extends Context {}

export type Apps = Dic<Dic<string>>