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
  sls: {
    enable: false,
    endpoint: '',
    project: '',
    store: 'aaa',
    accessId: 'LTAI4Fr1xFY36ThwzVKkqTgH',
    accessKey: 'Eg02rdV23TT1VaH8ONmxKSa7wgw8Pk',
  },
  docs: {
    path: '/doc',
    filter: false,
    expansion: 'list', // 可选full,list,none
    info: {
      title: '平台接口文档',
      description: '平台接口文档，包含用户端和管理端'
    },
  },
}
