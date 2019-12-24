require('source-map-support/register')

// 类型声明
export * from './typings'

// 常用工具
import axios from 'axios'
import BigNumber from 'bignumber.js'
import HashIds from 'hashids'
import * as _ from 'lodash'
import * as moment from 'moment'
import $ from './coa-helper'

export { _, $, moment, axios, BigNumber, HashIds }

// serve相关
export { default as serve } from './bin-serve'

// core相关
export { default as env } from './coa-env'
export { default as echo } from './coa-echo'
export { default as die } from './coa-die'
export { default as secure } from './coa-secure'
export { default as sls } from './coa-sls'

// 数据库相关
export { default as redis } from './coa-db-redis/redis'
export { default as cache } from './coa-db-redis/cache'
export { default as mongo } from './coa-db-mongo/mongo'
export { default as mysql } from './coa-db-mysql/mysql'
export { MongoNative } from './coa-db-mongo/MongoNative'
export { MysqlNative } from './coa-db-mysql/MysqlNative'
export { MysqlCached } from './coa-db-mysql/MysqlCached'

// 数据相关
export { default as data } from './coa-data'
export { default as uuid } from './coa-db-mysql-uuid'
export { default as lock } from './coa-db-redis-lock'
export { default as storage } from './coa-db-mysql-storage'
export { Queue } from './coa-queue'