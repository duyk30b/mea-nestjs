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
    const clientId = request.headers['x-client-id'] as string
    const authorization = request.headers.authorization || ''

    const ip = getClientIp(request)
    const dataExternal: TExternal = {
      clientId,
      ip,
      os,
      browser,
      mobile: mobile === '1' ? 1 : 0,
      uid: null,
      oid: null,
      user: null,
      organization: null,
      permissionIds: [],
      roomIds: [],
      error: null,
    }

    const [, accessToken] = authorization.split(' ')
    if (accessToken) {
      try {
        const decode = this.jwtExtendService.verifyAccessToken(accessToken, ip)
        const { oid, uid } = decode.data
        dataExternal.oid = oid
        dataExternal.uid = uid

        const checkTokenCache = await this.cacheTokenService.checkAccessToken({
          oid,
          uid,
          accessExp: decode.exp,
        })

        if (checkTokenCache) {
          dataExternal.user = await this.cacheDataService.getUser(oid, uid)
          dataExternal.organization = await this.cacheDataService.getOrganization(oid)
          dataExternal.permissionIds = await this.cacheDataService.getPermissionIdsByUserId(
            oid,
            uid
          )
          dataExternal.roomIds = await this.cacheDataService.getRoomIdList(oid, uid)
        } else {
          dataExternal.error = 'error.Token.AccessTokenNoCache'
          if (process.env.NODE_ENV !== 'production') {
            // dataExternal.error = null
            // dataExternal.user = await this.cacheDataService.getUser(dataExternal.uid)
            // dataExternal.organization = await this.cacheDataService.getOrganization(dataExternal.oid)
          }
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
