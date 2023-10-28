import { Injectable } from '@nestjs/common'
import { CacheManagerService } from './cache-manager.service'

export type TokenCache = {
  code: string
  accessToken: string
  refreshToken: string
  refreshExp: number
  ip: string
  os: string
  browser: string
  mobile: 1 | 0
}

@Injectable()
export class CacheTokenService {
  constructor(private cacheManagerService: CacheManagerService) {}

  async newToken(options: {
    oid: number
    userId: number
    refreshExp: number
    accessToken: string
    refreshToken: string
    ip: string
    os: string
    browser: string
    mobile: 1 | 0
  }) {
    const { oid, refreshExp, userId, accessToken, refreshToken, ip, os, mobile, browser } = options
    const key = `TOKEN_${oid}_${userId}`
    const dataPlain = await this.cacheManagerService.get(key)

    let dataObject: TokenCache[] = JSON.parse((dataPlain as string) || '[]')
    dataObject = dataObject.filter((i) => i.refreshExp > Date.now())

    dataObject.push({
      code: Date.now().toString(36),
      accessToken,
      refreshToken,
      refreshExp,
      ip,
      os,
      mobile,
      browser,
    })
    await this.cacheManagerService.set(key, JSON.stringify(dataObject))
  }

  async updateToken(options: {
    oid: number
    userId: number
    ip: string
    accessToken: string
    refreshToken: string
    refreshExp: number
    os: string
    browser: string
    mobile: 1 | 0
  }) {
    const { oid, userId, accessToken, refreshToken, refreshExp, ip, os, mobile, browser } = options
    const key = `TOKEN_${oid}_${userId}`
    const dataPlain = await this.cacheManagerService.get(key)

    let dataObject: TokenCache[] = JSON.parse((dataPlain as string) || '[]')
    dataObject = dataObject.filter((i) => i.refreshExp > Date.now())

    const curToken = dataObject.find((i) => i.refreshToken === refreshToken)
    if (curToken) {
      curToken.accessToken = accessToken
    } else {
      dataObject.push({
        code: Date.now().toString(36),
        accessToken,
        refreshToken,
        refreshExp,
        ip,
        os,
        mobile,
        browser,
      })
    }
    await this.cacheManagerService.set(key, JSON.stringify(dataObject))
  }

  async delToken(options: { oid: number; userId: number; refreshToken: string }) {
    const { oid, userId, refreshToken } = options
    const key = `TOKEN_${oid}_${userId}`
    const dataPlain = await this.cacheManagerService.get(key)
    const dataObject: TokenCache[] = JSON.parse((dataPlain as string) || '[]')

    const indexToken = dataObject.findIndex((i) => i.refreshToken === refreshToken)
    if (indexToken !== -1) {
      dataObject.splice(indexToken, 1)
      await this.cacheManagerService.set(key, JSON.stringify(dataObject))
    }
  }

  async checkToken(options: { oid: number; userId: number; accessToken: string }) {
    const { oid, userId, accessToken } = options
    const key = `TOKEN_${oid}_${userId}`
    const dataPlain = await this.cacheManagerService.get(key)
    const dataObject: TokenCache[] = JSON.parse((dataPlain as string) || '[]')

    if (dataObject.length === 0) return false

    for (const obj of dataObject) {
      if (obj.accessToken === accessToken) {
        return true
      }
    }
    return false
  }

  async getToken(options: { oid: number; userId: number }) {
    const { oid, userId } = options
    const key = `TOKEN_${oid}_${userId}`
    const dataPlain = await this.cacheManagerService.get(key)
    const dataObject: TokenCache[] = JSON.parse((dataPlain as string) || '[]')

    return dataObject
  }

  async removeDevice(options: { oid: number; userId: number; code: string }) {
    const { userId, oid, code } = options

    const key = `TOKEN_${oid}_${userId}`
    const dataPlain = await this.cacheManagerService.get(key)
    const dataObject: TokenCache[] = JSON.parse((dataPlain as string) || '[]')

    const indexToken = dataObject.findIndex((i) => i.code === code)
    if (indexToken !== -1) {
      dataObject.splice(indexToken, 1)
      await this.cacheManagerService.set(key, JSON.stringify(dataObject))
    }
    return true
  }
}
