import * as Knex from 'knex'

export type SafePartial<T> = T extends {} ? Partial<T> : any
export type Query = (qb: Knex.QueryBuilder) => void
export type QueryBuilder = Knex.QueryBuilder
export type Transaction = Knex.Transaction
export type Page = { rows: number, last: number }
export type ModelOption<T> = {
  name: string,
  scheme: T,
  title?: string,
  key?: string,
  prefix?: string,
  database?: string,
  increment?: string,
  ms?: number,
  pick: string[],
  unpick?: string[],
  caches?: { [name: string]: string[] },
}