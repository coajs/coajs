import * as Knex from 'knex'
import { die, echo, env } from '..'

const mysql = Knex({
  client: 'mysql',
  connection: {
    host: env.mysql.host,
    port: env.mysql.port,
    user: env.mysql.user,
    password: env.mysql.password,
    database: env.mysql.database,
    charset: env.mysql.charset,
  },
  debug: env.mysql.debug || false,
})

mysql.on('query-error', function (error: any) {
  if (env.debug) {
    echo.error(error)
  }
  if (error.sqlMessage)
    die.error(error.sqlMessage, 400, error.errno + ': ' + error.code)
  else
    die.error(error.toString())
})

env.mysql.trace && mysql.on('query', function (data: any) {
  echo.grey('* SQL: %s', mysql.raw(data.sql, data.bindings).toString())
})

export default mysql