export * from './bin-serve/typings'
export * from './bin-serve-route/typings'
export * from './coa-db-mysql/typings'

export interface Dic<T> {
  [index: string]: T
}

export interface Session {
  [index: string]: string | string[]
}

declare module 'coa-env' {
  interface Env {
    redis: any
    mysql: any
    docs: any
  }
}