require('source-map-support/register')

// 类型声明
export * from './typings'

// 常用工具
import * as _ from 'lodash'
import * as moment from 'moment'
import $ from './coa-helper'

export { _, $, moment }

// serve相关
export { default as serve } from './coa-serve'

// core相关
export { default as env } from './coa-env'
export { default as echo } from './coa-echo'
export { default as die } from './coa-die'
export { default as action } from './coa-action'

// 扩展相关
export { default as secure } from './coa-secure'

// 数据相关
export { default as data } from './coa-data'
export { default as uuid } from './coa-uuid'
export { default as lock } from './coa-lock'

// 数据库相关
export { default as mongo } from './coa-db-mongo/mongo'
export { default as mysql } from './coa-db-mysql/mysql'
export { default as cache } from './coa-db-redis/cache'
export { MongoNative } from './coa-db-mongo/MongoNative'
export { MysqlNative } from './coa-db-mysql/MysqlNative'
export { MysqlCached } from './coa-db-mysql/MysqlCached'
