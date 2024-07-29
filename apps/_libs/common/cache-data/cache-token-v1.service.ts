import { Injectable } from '@nestjs/common'

export type TokenDataType = {
  code: string // code để làm đăng xuất vừa để biết thời gian đăng nhập của thiết bị
  oid: number
  uid: number
  accessToken: string
  refreshToken: string
  refreshExp: number
  ip: string
  os: string
  browser: string
  mobile: 1 | 0
}

@Injectable()
export class CacheTokenV1Service {
  private cache: Record<string, TokenDataType[]> = {}

  private getKey(data: { oid: number; uid: number }) {
    return `TOKEN_${data.oid}_${data.uid}`
  }

  private removeTokenExpires(data: { oid: number; uid: number }) {
    const key = this.getKey(data)
    if (!this.cache[key]) this.cache[key] = []

    this.cache[key] = this.cache[key].filter((i) => i.refreshExp > Date.now())
  }

  newToken(data: Omit<TokenDataType, 'code'>) {
    const key = this.getKey(data)
    if (!this.cache[key]) this.cache[key] = []
    this.cache[key].push({
      ...data,
      code: Date.now().toString(36),
    })
  }

  updateToken(data: Omit<TokenDataType, 'code'>) {
    const key = this.getKey(data)
    if (!this.cache[key]) this.cache[key] = []

    const currentToken = this.cache[key].find((i) => i.refreshToken === data.refreshToken)
    if (currentToken) {
      Object.assign(currentToken, {
        ...data,
        code: Date.now().toString(36),
      })
    } else {
      this.cache[key].push({
        ...data,
        code: Date.now().toString(36),
      })
    }
  }

  delToken(data: { oid: number; uid: number; refreshToken: string }) {
    const key = this.getKey(data)
    if (!this.cache[key]) this.cache[key] = []
    const indexToken = this.cache[key].findIndex((i) => i.refreshToken === data.refreshToken)
    if (indexToken !== -1) {
      this.cache[key].splice(indexToken, 1)
    }
  }

  delAllTOken(data: { oid: number; uid: number }) {
    const key = this.getKey(data)
    this.cache[key] = []
  }

  checkToken(data: { oid: number; uid: number; accessToken: string }) {
    const key = this.getKey(data)
    if (!this.cache[key]) this.cache[key] = []
    this.removeTokenExpires({ oid: data.oid, uid: data.uid })
    return this.cache[key].some((i) => i.accessToken === data.accessToken)
  }

  getTokenList(data: { oid: number; uid: number }) {
    const key = this.getKey(data)
    if (!this.cache[key]) this.cache[key] = []
    this.removeTokenExpires({ oid: data.oid, uid: data.uid })
    return this.cache[key]
  }

  removeDevice(data: { oid: number; uid: number; code: string }) {
    const key = this.getKey(data)
    if (!this.cache[key]) this.cache[key] = []

    const indexToken = this.cache[key].findIndex((i) => i.code === data.code)
    if (indexToken !== -1) {
      this.cache[key].splice(indexToken, 1)
    }
  }

  removeAllExcludeRoot() {
    const keyRoot = this.getKey({ oid: 1, uid: 1 })
    for (const key in this.cache) {
      if (key === keyRoot) continue
      else this.cache[key] = []
    }
  }
}
