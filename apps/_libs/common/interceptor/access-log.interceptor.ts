import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common'
import { KafkaContext, NatsContext } from '@nestjs/microservices'
import { ThrottlerException } from '@nestjs/throttler'
import { Observable, throwError } from 'rxjs'
import { catchError, tap } from 'rxjs/operators'
import * as url from 'url'
import { SystemLogEmit } from '../../../api-public/src/event-listener/system-log/system-log.emit'
import { BusinessError } from '../../database/common/error'
import { SystemLogInsertType } from '../../mongo/collections/system-log/system-log.schema'
import { BusinessException, ValidationException } from '../exception-filter/exception-filter'
import { RequestExternal } from '../request/external.request'
import { FullResponse } from './transform-response.interceptor'

@Injectable()
export class AccessLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AccessLogInterceptor.name)

  constructor(private readonly systemLogEmit: SystemLogEmit) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const createTime = new Date()
    const className = context.getClass().name
    const funcName = context.getHandler().name
    const [req, reply] = context.getArgs()

    const systemLog: SystemLogInsertType = {} as any
    systemLog.controller = {} as any

    if (context.getType() === 'http') {
      const ctx = context.switchToHttp()
      const request = ctx.getRequest()
      const { external }: RequestExternal = request.raw

      systemLog.clientId = external.clientId
      systemLog.ip = external.ip
      systemLog.browser = external.browser
      systemLog.mobile = external.mobile
      systemLog.uid = external.uid
      systemLog.oid = external.oid

      const urlParse = url.parse(request.originalUrl, true)

      systemLog.prefixController = urlParse.pathname.split('/').filter((i) => !!i)[0]
      systemLog.apiMethod = request.method
      systemLog.url = `${request.protocol}://${request.raw.hostname}${urlParse.pathname}`
      systemLog.query = urlParse.query

      systemLog.controller.className = className
      systemLog.controller.funcName = funcName
      systemLog.body = request.body
    } else if (context.getType() === 'rpc') {
      if (reply.constructor.name === 'NatsContext') {
        const response: NatsContext = reply
        systemLog.apiMethod = 'NATS'
        systemLog.controller.subject = response.getSubject()
        systemLog.controller.className = className
        systemLog.controller.funcName = funcName
        systemLog.request = req
      }
      if (reply.constructor.name === 'KafkaContext') {
        const response: KafkaContext = reply
        systemLog.apiMethod = 'KAFKA'
        systemLog.controller.topic = response.getTopic()
        systemLog.controller.partition = response.getPartition()
        systemLog.controller.offset = response.getMessage().offset
        systemLog.controller.className = className
        systemLog.controller.funcName = funcName
        systemLog.request = req
      }
    }

    return next.handle().pipe(
      catchError((err) => {
        systemLog.errorName = err['constructor'].name
        systemLog.errorMessage = err.message
        systemLog.timeMs = Date.now() - createTime.getTime()

        switch (err['constructor'].name) {
          case BusinessError.name: {
            systemLog.statusCode = HttpStatus.BAD_REQUEST
            this.logger.error(JSON.stringify(systemLog))
            break
          }
          case ValidationException.name: {
            systemLog.statusCode = HttpStatus.UNPROCESSABLE_ENTITY
            systemLog.errorObject = err.errors
            this.logger.warn(JSON.stringify(systemLog))
            break
          }
          case BusinessException.name: {
            const businessException = err as BusinessException
            systemLog.statusCode = businessException.statusCode
            break
          }
          case ThrottlerException.name: {
            systemLog.statusCode = HttpStatus.TOO_MANY_REQUESTS
            break
          }
          case NotFoundException.name: {
            systemLog.statusCode = HttpStatus.NOT_FOUND
            break
          }
          case ForbiddenException.name: {
            systemLog.statusCode = HttpStatus.FORBIDDEN
            break
          }
          case HttpException.name: {
            systemLog.statusCode = (err as any).status
            break
          }
          default: {
            systemLog.statusCode = HttpStatus.INTERNAL_SERVER_ERROR
            this.logger.error(JSON.stringify(systemLog))
          }
        }
        this.systemLogEmit.emitSystemLogInsert({ data: systemLog })
        return throwError(() => err)
      }),
      tap((res: FullResponse) => {
        systemLog.timeMs = Date.now() - createTime.getTime()
        systemLog.oid = res.meta.oid
        systemLog.uid = res.meta.uid
        systemLog.clientId = res.meta.clientId
        systemLog.statusCode = res.statusCode
        this.logger.log(JSON.stringify(systemLog))
        if (systemLog.apiMethod === 'POST') {
          this.systemLogEmit.emitSystemLogInsert({ data: systemLog })
        }
      })
    )
  }
}
