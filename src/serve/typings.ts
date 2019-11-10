import * as Koa from 'koa'
import contextExtend from './context'

declare type ContextExtend = typeof contextExtend;

declare module "koa" {
  interface Request {
    body?: any;
    rawBody: string;
  }
}

export interface Context extends ContextExtend, Koa.Context {}

export interface ContextExt extends Context {}





