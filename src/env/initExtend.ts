export default {
  mongo: {
    host: '127.0.0.1',
    port: 27017,
    database: 'local',
    username: 'root',
    password: 'root',
  },
  docs: {
    expansion: 'list', // 可选full,list,none
    filter: false,
    info: {
      title: '平台接口文档',
      description: '平台接口文档，包含用户端和管理端'
    },
  },
}
