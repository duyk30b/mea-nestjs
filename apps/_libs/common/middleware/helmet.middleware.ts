import helmet from '@fastify/helmet'
import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction } from 'express'
import { FastifyReply, FastifyRequest } from 'fastify'

@Injectable()
export class HelmetMiddleware implements NestMiddleware {
  async use(request: FastifyRequest, response: FastifyReply, next: NextFunction) {
    console.log(
      '🚀 ~ file: helmet.middleware.ts:14 ~ HelmetMiddleware ~ use ~ originalUrl:',
      request.originalUrl
    )
    return next()
  }
}
