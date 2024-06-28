import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction } from 'express'
import { FastifyReply, FastifyRequest } from 'fastify'
import { getClientIp } from 'request-ip'
import { CacheDataService } from '../../transporter/cache-manager/cache-data.service'
import { CacheTokenService } from '../../transporter/cache-manager/cache-token.service'
import { JwtExtendService } from '../jwt-extend/jwt-extend.service'
import { RequestExternal, TExternal } from '../request/external.request'
import { IAccessTokenPayload } from '../request/payload'

@Injectable()
export class DetectClientMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtExtendService: JwtExtendService,
    private readonly cacheTokenService: CacheTokenService,
    private readonly cacheDataService: CacheDataService
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
        const decode: IAccessTokenPayload = this.jwtExtendService.verifyAccessToken(accessToken, ip)
        dataExternal.oid = decode.oid
        dataExternal.uid = decode.uid

        const checkTokenCache = this.cacheTokenService.checkToken({
          oid: decode.oid,
          uid: decode.uid,
          accessToken,
        })

        if (checkTokenCache) {
          dataExternal.user = await this.cacheDataService.getUser(decode.uid)
          dataExternal.organization = await this.cacheDataService.getOrganization(decode.oid)
          dataExternal.rid = dataExternal.user.roleId
          dataExternal.role = await this.cacheDataService.getRole(dataExternal.user.roleId)
        } else {
          dataExternal.error = 'error.Token.Expired'
          if (process.env.NODE_ENV !== 'production') {
            dataExternal.error = null
            dataExternal.user = await this.cacheDataService.getUser(decode.uid)
            dataExternal.organization = await this.cacheDataService.getOrganization(decode.oid)
            dataExternal.rid = dataExternal.user.roleId
            dataExternal.role = await this.cacheDataService.getRole(dataExternal.user.roleId)
          }
        }
      } catch (error) {
        dataExternal.error = 'error.Token.Invalid'
      }
    }

    const requestExternal = request as RequestExternal
    requestExternal.external = dataExternal

    return next()
  }
}
