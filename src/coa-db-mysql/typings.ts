import * as Knex from 'knex'

export type SafePartial<T> = T extends {} ? Partial<T> : any
export type Query = (qb: Knex.QueryBuilder) => void
export type QueryBuilder = Knex.QueryBuilder
export type Transaction = Knex.Transaction
export type Page = { rows: number, last: number }
export type ModelOption<T> = { name: string, title?: string, key?: string, prefix?: string, scheme: T, pick: string[], unpick?: string[], caches?: { [name: string]: string[] }, database?: string }
