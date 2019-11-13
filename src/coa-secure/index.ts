import * as crypto from 'crypto'
import { BinaryLike, createHash, createHmac, HexBase64BinaryEncoding, HexBase64Latin1Encoding, Utf8AsciiBinaryEncoding } from 'crypto'
import { _, DataSet } from '..'

export default new class {

  sha1 (data: BinaryLike, digest: HexBase64Latin1Encoding = 'hex') {
    return createHash('sha1').update(data).digest(digest)
  }

  md5 (data: BinaryLike, digest: HexBase64Latin1Encoding = 'hex') {
    return createHash('md5').update(data).digest(digest)
  }

  sha1_hmac (str: BinaryLike, key: string, digest: HexBase64Latin1Encoding = 'hex') {
    return createHmac('sha1', key).update(str).digest(digest)
  }

  base64_encode (str: string) {
    return Buffer.from(str).toString('base64')
  }

  rsa_sha256 (data: any, key: string) {
    return crypto.createSign('RSA-SHA256').update(data).sign(key, 'base64')
  }

  base64_decode (base64: string) {
    return Buffer.from(base64, 'base64').toString()
  }

  aes_encode (data: any, key = '', iv = ''): string {
    if (!data) return ''
    let clearEncoding: Utf8AsciiBinaryEncoding = 'utf8', cipherEncoding: HexBase64BinaryEncoding = 'base64', cipherChunks = [] as string[]
    let cipher = crypto.createCipheriv('aes-256-ecb', key, iv)
    cipher.setAutoPadding(true)
    cipherChunks.push(cipher.update(data, clearEncoding, cipherEncoding))
    cipherChunks.push(cipher.final(cipherEncoding))
    return cipherChunks.join('')
  }

  aes_decode (data: any, key = '', iv = ''): string {
    if (!data) return ''
    let clearEncoding: Utf8AsciiBinaryEncoding = 'utf8', cipherEncoding: HexBase64BinaryEncoding = 'base64', cipherChunks = [] as string[]
    let decipher = crypto.createDecipheriv('aes-256-ecb', key, iv)
    decipher.setAutoPadding(true)
    cipherChunks.push(decipher.update(data, cipherEncoding, clearEncoding))
    cipherChunks.push(decipher.final(clearEncoding))
    return cipherChunks.join('')
  }

  session_encode (info: DataSet, maxAge: number) {
    const value = JSON.stringify(info)
    const time = _.toString(_.now() + maxAge).substr(0, 10)
    const sign = this.md5(time + value).substr(-8)
    return this.base64_encode(sign + time + value)
  }

  session_decode (str: string) {

    str = this.base64_decode(str)

    const sign = str.substr(0, 8)
    const time = _.toNumber(str.substr(8, 10))
    const value = str.substr(18)

    if (time * 1000 >= _.now() && sign === this.md5(time + value).substr(-8)) {
      try {
        return JSON.parse(value)
      } catch (e) {
        return null
      }
    } else
      return null
  }

}