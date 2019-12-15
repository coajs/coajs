import * as zlib from 'zlib'
import { axios, Dic, echo, env, secure } from '..'

const project = env.sls.project
const endpoint = env.sls.endpoint
const accessKeyId = env.sls.accessId
const secretAccessKey = env.sls.accessKey
const defaultStore = env.sls.store as string
const enable = !!(env.sls.enable && endpoint && project)

export default new class {

  public enable = enable
  private ProtoBuffer: any

  async logs (logs: any[], store = defaultStore) {

    const path = `/logstores/${store}/shards/lb`
    const url = `https://${project}.${endpoint}${path}`
    const data_proto = this.protoBufferEncode('LogGroup', { logs })
    const data_deflate = zlib.deflateSync(data_proto)

    const headers = {
      'Content-Type': 'application/x-protobuf',
      'Content-MD5': secure.md5(data_deflate).toUpperCase(),
      'Date': new Date().toUTCString(),
      'x-log-apiversion': '0.6.0',
      'x-log-bodyrawsize': data_proto.length,
      'x-log-compresstype': 'deflate',
      'x-log-signaturemethod': 'hmac-sha1',
    }
    this.attachAuthorization(headers, path)

    await axios.post(url, data_deflate, { headers }).catch(e => {
      const data = e.response.data
      echo.error('* SLS上报错误: [%s] %s', data.errorCode, data.errorMessage)
    })

  }

  private protoBufferEncode (name: string, data: any) {
    if (!this.ProtoBuffer) {
      this.ProtoBuffer = require('pomelo-protobuf')
      const proto = this.ProtoBuffer.parse(require('./proto/log').default)
      this.ProtoBuffer.init({ encoderProtos: proto, decoderProtos: proto })
    }
    return this.ProtoBuffer.encode(name, data)
  }

  private attachAuthorization (headers: Dic<any>, path: string, method = 'POST') {
    const signs = [] as string[]
    signs.push(method)
    signs.push(headers['Content-MD5'])
    signs.push(headers['Content-Type'])
    signs.push(headers['Date'])
    signs.push('x-log-apiversion:' + headers['x-log-apiversion'])
    signs.push('x-log-bodyrawsize:' + headers['x-log-bodyrawsize'])
    signs.push('x-log-compresstype:' + headers['x-log-compresstype'])
    signs.push('x-log-signaturemethod:' + headers['x-log-signaturemethod'])
    signs.push(path)
    const signature = secure.sha1_hmac(signs.join('\n'), secretAccessKey, 'base64')
    headers['Authorization'] = 'LOG ' + accessKeyId + ':' + signature
  }

}