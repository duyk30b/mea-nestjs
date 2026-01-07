import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { KafkaContext, NatsContext } from '@nestjs/microservices'
import { Observable, throwError } from 'rxjs'
import { catchError, tap } from 'rxjs/operators'
import * as url from 'url'
import { SystemLogEmit } from '../../../api-public/src/event-listener/system-log/system-log.emit'
import { SystemLogInsertType } from '../../mongo/collections/system-log/system-log.schema'
import { ValidationException } from '../exception-filter/exception-filter'
import { RequestExternal } from '../request/external.request'

@Injectable()
export class AccessLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AccessLogInterceptor.name)

  constructor(private readonly systemLogEmit: SystemLogEmit) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const createTime = new Date()
    const className = context.getClass().name
    const funcName = context.getHandler().name
    const [req, res] = context.getArgs()

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
      systemLog.username = external.user?.username

      const urlParse = url.parse(request.originalUrl, true)

      systemLog.prefixController = urlParse.pathname.split('/').filter((i) => !!i)[0]
      systemLog.apiMethod = request.method
      systemLog.url = `${request.protocol}://${request.raw.hostname}${urlParse.pathname}`
      systemLog.query = urlParse.query

      systemLog.controller.className = className
      systemLog.controller.funcName = funcName
      systemLog.body = request.body
    } else if (context.getType() === 'rpc') {
      if (res.constructor.name === 'NatsContext') {
        const response: NatsContext = res
        systemLog.apiMethod = 'NATS'
        systemLog.controller.subject = response.getSubject()
        systemLog.controller.className = className
        systemLog.controller.funcName = funcName
        systemLog.request = req
      }
      if (res.constructor.name === 'KafkaContext') {
        const response: KafkaContext = res
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
        systemLog.errorMessage = err.message
        systemLog.timeMs = Date.now() - createTime.getTime()
        if (err instanceof ValidationException) {
          systemLog.errorObject = err.errors
          this.logger.warn(JSON.stringify(systemLog))
        } else {
          this.logger.error(JSON.stringify(systemLog))
        }
        this.systemLogEmit.emitSystemLogInsert({ data: systemLog })
        return throwError(() => err)
      }),
      tap((xx: any) => {
        systemLog.timeMs = Date.now() - createTime.getTime()
        this.logger.log(JSON.stringify(systemLog))
        if (systemLog.apiMethod === 'POST') {
          this.systemLogEmit.emitSystemLogInsert({ data: systemLog })
        }
      })
    )
  }
}
