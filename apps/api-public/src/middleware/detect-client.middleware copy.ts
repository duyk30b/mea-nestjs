import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Response } from 'express'
import { FastifyReply, FastifyRequest } from 'fastify'
import { getClientIp } from 'request-ip'
import { RequestExternal } from '../../../_libs/common/request/external.request'

@Injectable()
export class DetectClientMiddleware implements NestMiddleware {
  async use(request: FastifyRequest, response: FastifyReply, next: NextFunction) {
    const ip = getClientIp(request)
    const requestExternal = request as RequestExternal
    if (requestExternal.external) {
      throw new Error('Cannot replace property "external"')
    }
    requestExternal.external = { ip }
    next()
  }
}
