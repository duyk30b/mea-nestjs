import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Response } from 'express'
import { FastifyReply, FastifyRequest } from 'fastify'
import { BusinessException } from '../../../_libs/common/exception-filter/exception-filter'
import { RequestExternal, TExternal } from '../../../_libs/common/request/external.request'
import { JwtExtendService } from '../components/jwt-extend/jwt-extend.service'

@Injectable()
export class ValidateTokenMiddleware implements NestMiddleware {
  constructor(private readonly jwtExtendService: JwtExtendService) {}

  async use(request: FastifyRequest['raw'], res: FastifyReply['raw'], next: NextFunction) {
    if (request.method === 'OPTIONS') return next()

    const requestExternal = request as unknown as RequestExternal
    const authorization = request.headers.authorization || ''

    const [, accessToken] = authorization.split(' ')

    if (!accessToken) {
      // fastify không throw Error trực tiếp trong middleware được mà cần phải return next
      return next(new BusinessException('error.Token.Empty', HttpStatus.UNAUTHORIZED))
    }

    try {
      const decode: TExternal = this.jwtExtendService.verifyAccessToken(
        accessToken,
        requestExternal.external.ip
      )
      requestExternal.external = {
        ...requestExternal.external,
        ...decode,
      }
      return next()
    } catch (error) {
      return next(error)
    }
  }
}
