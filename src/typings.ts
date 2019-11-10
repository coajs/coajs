export * from './action/typings'
export * from './serve/typings'
export * from './env/typings'
export * from './db-mysql/typings'

declare type Basic = string | number | boolean | null | Date | undefined

export interface DataSet {
  [index: string]: Basic | Basic[] | DataSet | DataSet[]
}

export interface Dic<T> {
  [index: string]: T
}

export type Partial<T> = {
  [U in keyof T]?: T[U] extends {} ? Partial<T[U]> : T[U]
};
