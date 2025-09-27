import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { KafkaContext, NatsContext } from '@nestjs/microservices'
import { Observable, throwError } from 'rxjs'
import { catchError, tap } from 'rxjs/operators'
import * as url from 'url'
import { ValidationException } from '../exception-filter/exception-filter'
import { RequestExternal } from '../request/external.request'

@Injectable()
export class AccessLogInterceptor implements NestInterceptor {
  constructor(private readonly logger = new Logger(AccessLogInterceptor.name)) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const createTime = new Date()
    const className = context.getClass().name
    const funcName = context.getHandler().name
    const [req, res] = context.getArgs()

    const showData = true
    const message: Record<string, any> = {}

    if (context.getType() === 'http') {
      const ctx = context.switchToHttp()
      const request = ctx.getRequest()
      const { external }: RequestExternal = request.raw
      const basicExternal = {
        ip: external.ip,
        browser: external.browser,
        mobile: external.mobile,
        uid: external.uid,
        oid: external.oid,
        username: external.user?.username,
        phone: external.organization?.phone,
        email: external.organization?.email,
      }

      const urlParse = url.parse(request.originalUrl, true)
      if (basicExternal.oid) {
        message.OID = basicExternal.oid
      }
      message.type = '[API]'
      message.method = request.method
      message.url = `${request.protocol}://${request.raw.hostname}${urlParse.pathname}`
      message.query = urlParse.query
      message.className = className
      message.funcName = funcName
      message.external = basicExternal
      if (showData) {
        message.body = request.body
      }
    } else if (context.getType() === 'rpc') {
      if (res.constructor.name === 'NatsContext') {
        const response: NatsContext = res
        message.type = '[NATS]'
        message.subject = response.getSubject()
        message.className = className
        message.funcName = funcName
        if (showData) {
          message.request = req
        }
      }
      if (res.constructor.name === 'KafkaContext') {
        const response: KafkaContext = res
        message.type = '[KAFKA]'
        message.topic = response.getTopic()
        message.partition = response.getPartition()
        message.offset = response.getMessage().offset
        message.className = className
        message.funcName = funcName
        if (showData) {
          message.request = req
        }
        message.topicInfo = {
          topic: response.getTopic(),
          partition: response.getPartition(),
          offset: response.getMessage().offset,
        }
      }
    }

    return next.handle().pipe(
      catchError((err) => {
        message.errorMessage = err.message
        message.time = `${Date.now() - createTime.getTime()}ms`
        if (err instanceof ValidationException) {
          message.errors = err.errors
          this.logger.warn(JSON.stringify(message))
        } else {
          this.logger.error(JSON.stringify(message))
        }
        return throwError(() => err)
      }),
      tap((xx: any) => {
        message.time = `${Date.now() - createTime.getTime()}ms`
        this.logger.log(JSON.stringify(message))
      })
    )
  }
}
