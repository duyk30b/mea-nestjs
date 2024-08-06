import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction } from 'express'
import { FastifyReply, FastifyRequest } from 'fastify'
import { getClientIp } from 'request-ip'
import { CacheDataService } from '../cache-data/cache-data.service'
import { CacheTokenService } from '../cache-data/cache-token.service'
import { JwtExtendService } from '../jwt-extend/jwt-extend.service'
import { RequestExternal, TExternal } from '../request/external.request'

@Injectable()
export class DetectClientMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtExtendService: JwtExtendService,
    private readonly cacheTokenService: CacheTokenService,
    private readonly cacheDataService: CacheDataService
  ) { }

  async use(request: FastifyRequest, response: FastifyReply, next: NextFunction) {
    if (request.method === 'OPTIONS') return next()

    const os = request.headers['x-os'] as string
    const browser = request.headers['x-browser'] as string
    const mobile = request.headers['x-mobile'] as string
    const authorization = request.headers.authorization || ''

    const ip = getClientIp(request)
    const dataExternal: TExternal = {
      ip,
      os,
      browser,
      mobile: mobile === '1' ? 1 : 0,
      uid: null,
      oid: null,
      rid: null,
      error: null,
      user: null,
      organization: null,
      role: null,
    }

    const [, accessToken] = authorization.split(' ')
    if (accessToken) {
      try {
        const decode = this.jwtExtendService.verifyAccessToken(accessToken, ip)
        dataExternal.oid = decode.data.oid
        dataExternal.uid = decode.data.uid

        const checkTokenCache = await this.cacheTokenService.checkAccessToken({
          oid: decode.data.oid,
          uid: decode.data.uid,
          accessExp: decode.exp,
        })

        if (checkTokenCache) {
          dataExternal.user = await this.cacheDataService.getUser(decode.data.uid)
          dataExternal.organization = await this.cacheDataService.getOrganization(decode.data.oid)
          dataExternal.rid = dataExternal.user.roleId
          dataExternal.role = await this.cacheDataService.getRole(dataExternal.user.roleId)
        } else {
          dataExternal.error = 'error.Token.AccessTokenNoCache'
          // if (process.env.NODE_ENV !== 'production') {
          //   dataExternal.error = null
          //   dataExternal.user = await this.cacheDataService.getUser(decode.uid)
          //   dataExternal.organization = await this.cacheDataService.getOrganization(decode.oid)
          //   dataExternal.rid = dataExternal.user.roleId
          //   dataExternal.role = await this.cacheDataService.getRole(dataExternal.user.roleId)
          // }
        }
      } catch (error) {
        dataExternal.error = error.message
      }
    }

    const requestExternal = request as RequestExternal
    requestExternal.external = dataExternal

    return next()
  }
}
