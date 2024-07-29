import { Injectable } from '@nestjs/common'
import { RedisService } from '../../transporter/redis/redis.service'

export type TokenDataType = {
  oid: number
  uid: number
  accessExp: number
  refreshExp: number
  ip: string
  os: string
  browser: string
  mobile: 1 | 0
  online: boolean | number
}

@Injectable()
export class CacheTokenService {
  constructor(private redisService: RedisService) { }

  private getKey(data: { oid: number; uid: number }) {
    return `TOKEN_${data.oid}_${data.uid}`
  }

  private async getTokenListByKey(key: string) {
    const value = await this.redisService.get(key)
    const object: TokenDataType[] = JSON.parse(value || '[]')
    return object
  }

  private async setTokenList(key: string, tokenList: TokenDataType[]) {
    const tokenListRemoveExpires = tokenList.filter((i) => i.refreshExp > Date.now())
    const value = JSON.stringify(tokenListRemoveExpires)
    await this.redisService.set(key, value)
  }

  async addAccessToken(data: Omit<TokenDataType, 'online'>) {
    const key = this.getKey(data)
    const tokenList = await this.getTokenListByKey(key)
    const tokenListFix = tokenList.filter((i) => i.refreshExp !== data.refreshExp)
    tokenListFix.push({
      ...data,
      online: Date.now(),
    })
    await this.setTokenList(key, tokenListFix)
  }

  async updateAccessToken(data: Omit<TokenDataType, 'online'>) {
    const key = this.getKey(data)
    const tokenList = await this.getTokenListByKey(key)

    const currentToken = tokenList.find((i) => i.refreshExp === data.refreshExp)
    if (currentToken) {
      Object.assign(currentToken, {
        ...data,
        online: Date.now(),
      })
    } else {
      tokenList.push({
        ...data,
        online: Date.now(),
      })
    }
    await this.setTokenList(key, tokenList)
  }

  async removeRefreshToken(options: { oid: number; uid: number; refreshExp: number }) {
    const key = this.getKey(options)
    const tokenList = await this.getTokenListByKey(key)

    const tokenListFix = tokenList.filter((i) => i.refreshExp !== options.refreshExp)
    await this.setTokenList(key, tokenListFix)
  }

  async removeAllRefreshToken(options: { oid: number; uid: number }) {
    const key = this.getKey(options)
    await this.setTokenList(key, [])
  }

  async checkAccessToken(options: { oid: number; uid: number; accessExp: number }) {
    const key = this.getKey(options)
    const tokenList = await this.getTokenListByKey(key)

    const token = tokenList.find((i) => i.accessExp === options.accessExp)
    if (!token) return false

    token.online = Date.now()
    await this.setTokenList(key, tokenList)
    return true
  }

  async checkRefreshToken(options: { oid: number; uid: number; refreshExp: number }) {
    const key = this.getKey(options)
    const tokenList = await this.getTokenListByKey(key)

    return tokenList.some((i) => i.refreshExp === options.refreshExp)
  }

  async getTokenList(options: { oid: number; uid: number }) {
    const key = this.getKey(options)
    return this.getTokenListByKey(key)
  }

  async removeAllExcludeRoot() {
    const keys = await this.redisService.getKeys('TOKEN_*')
    const keyRoot = this.getKey({ oid: 1, uid: 1 })
    for (let i = 0; i < keys.length; i++) {
      if (keys[i] === keyRoot) continue
      await this.redisService.del(keys[i])
    }
  }
}
