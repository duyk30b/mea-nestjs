import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction } from 'express'
import { FastifyReply, FastifyRequest } from 'fastify'
import { getClientIp } from 'request-ip'
import { RequestExternal, TExternal } from '../../../_libs/common/request/external.request'
import { IAccessTokenPayload } from '../../../_libs/common/request/payload'
import { CacheTokenService } from '../../../_libs/transporter/cache-manager/cache-token.service'
import { JwtExtendService } from '../auth/jwt-extend/jwt-extend.service'

@Injectable()
export class DetectClientMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtExtendService: JwtExtendService,
    private readonly cacheTokenService: CacheTokenService
  ) {}

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
    }

    const [, accessToken] = authorization.split(' ')
    if (accessToken) {
      try {
        const decode: IAccessTokenPayload = this.jwtExtendService.verifyAccessToken(accessToken, ip)
        const checkTokenCache = await this.cacheTokenService.checkToken({
          oid: decode.oid,
          userId: decode.uid,
          accessToken,
        })
        if (checkTokenCache) {
          Object.assign(dataExternal, decode)
        }
      } catch (error) {}
    }

    const requestExternal = request as RequestExternal
    requestExternal.external = dataExternal

    return next()
  }
}
