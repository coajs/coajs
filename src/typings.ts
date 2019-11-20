export * from './coa-action/typings'
export * from './coa-serve/typings'
export * from './coa-env/typings'
export * from './coa-db-mysql/typings'
import * as Axios from 'axios'

declare type Basic = string | number | boolean | null | Date | undefined

export interface DataSet {
  [index: string]: Basic | Basic[] | DataSet | DataSet[]
}

export interface Dic<T> {
  [index: string]: T
}

export { Axios }