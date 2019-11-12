export default {
  mongo: {
    host: '',
    port: 27017,
    database: 'local',
    username: 'root',
    password: 'root',
  },
  mysql: {
    host: '',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'test-d0',
    charset: 'utf8mb4',
    trace: false,
    debug: false,
  },
  redis: {
    host: '',
    port: 6379,
    password: '',
    db: 1,
    prefix: '',
    trace: false
  },
  docs: {
    expansion: 'list', // 可选full,list,none
    filter: false,
    sep: '/',
    info: {
      title: '平台接口文档',
      description: '平台接口文档，包含用户端和管理端'
    },
  },
}
