import { Injectable } from '@nestjs/common'
import { RedisService } from '../../transporter/redis/redis.service'

export type TokenDataType = {
  oid: number
  uid: number
  clientId: string
  accessExp: number
  refreshExp: number
  ip: string
  os: string
  browser: string
  mobile: 1 | 0
  lastOnline?: number
}

@Injectable()
export class CacheTokenService {
  constructor(private redisService: RedisService) { }

  private getKeyClient(data: { oid: number; uid: number; clientId: string }) {
    return `TOKEN_${data.oid}_${data.uid}_${data.clientId}`
  }

  private getKeyUser(data: { oid: number; uid: number }) {
    return `TOKEN_${data.oid}_${data.uid}`
  }

  private getKeyOrganization(data: { oid: number }) {
    return `TOKEN_${data.oid}`
  }

  async setClient(data: TokenDataType) {
    const key = this.getKeyClient(data)
    await this.redisService.set(key, JSON.stringify(data))
  }

  async removeClient(data: { oid: number; uid: number; clientId: string }) {
    const key = this.getKeyClient(data)
    await this.redisService.del(key)
  }

  async removeUser(data: { oid: number; uid: number }) {
    const { oid, uid } = data
    const key = this.getKeyUser({ oid, uid })
    const keyUserList = await this.redisService.getKeys(`${key}_*`)
    for (let i = 0; i < keyUserList.length; i++) {
      await this.redisService.del(keyUserList[i])
    }
  }

  async checkClient(data: { oid: number; uid: number; clientId: string }) {
    try {
      const { oid, uid, clientId } = data
      const key = this.getKeyClient({ oid, uid, clientId })
      const token = await this.redisService.get(key)
      return !!token
    } catch (error) {
      return false
    }
  }

  async setLastOnline(data: { oid: number; uid: number; clientId: string }) {
    const key = this.getKeyClient(data)
    const tokenString = await this.redisService.get(key)
    if (!tokenString) return
    const tokenObject: TokenDataType = JSON.parse(tokenString)
    tokenObject.lastOnline = Date.now()
    await this.redisService.set(key, JSON.stringify(tokenObject))
  }

  async getTokenListByUser(data: { oid: number; uid: number }) {
    const { oid, uid } = data
    const key = this.getKeyUser({ oid, uid })
    const keyUserList = await this.redisService.getKeys(`${key}_*`)
    const tokenList: TokenDataType[] = []
    for (let i = 0; i < keyUserList.length; i++) {
      const tokenString = await this.redisService.get(keyUserList[i])
      if (!tokenString) continue
      const tokenObject: TokenDataType = JSON.parse(tokenString)
      tokenList.push(tokenObject)
    }
    return tokenList
  }

  async getTokenListByOrganization(data: { oid: number }) {
    const { oid } = data
    const key = this.getKeyOrganization({ oid })
    const keyClientList = await this.redisService.getKeys(`${key}_*`)
    const tokenList: TokenDataType[] = []
    for (let i = 0; i < keyClientList.length; i++) {
      const tokenString = await this.redisService.get(keyClientList[i])
      if (!tokenString) continue
      const tokenObject: TokenDataType = JSON.parse(tokenString)
      tokenList.push(tokenObject)
    }
    return tokenList
  }

  async getTokenListAll() {
    const keyClientList = await this.redisService.getKeys(`TOKEN_*`)
    const tokenList: TokenDataType[] = []
    for (let i = 0; i < keyClientList.length; i++) {
      const tokenString = await this.redisService.get(keyClientList[i])
      if (!tokenString) continue
      const tokenObject: TokenDataType = JSON.parse(tokenString)
      tokenList.push(tokenObject)
    }
    return tokenList
  }

  async removeAllExcludeRoot() {
    const keys = await this.redisService.getKeys('TOKEN_*')
    const keyRoot = this.getKeyUser({ oid: 1, uid: 1 })
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].includes(`${keyRoot}_`)) continue
      await this.redisService.del(keys[i])
    }
  }
}
