import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { KafkaContext, NatsContext } from '@nestjs/microservices'
import { Request } from 'express'
import { Observable, throwError } from 'rxjs'
import { catchError, tap } from 'rxjs/operators'
import { ValidationException } from '../exception-filter/exception'

@Injectable()
export class AccessLogInterceptor implements NestInterceptor {
    constructor(private readonly logger = new Logger('ACCESS_LOG')) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const createTime = new Date()
        const className = context.getClass().name
        const funcName = context.getHandler().name
        const [req, res] = context.getArgs()

        const showData = true
        const message: Record<string, any> = {}

        if (context.getType() === 'http') {
            const ctx = context.switchToHttp()
            const request: Request = ctx.getRequest()
            const { originalUrl, method, body } = request
            message.type = '[API]'
            message.method = method
            message.url = originalUrl
            message.className = className
            message.funcName = funcName
            message.external = (request as any).external
            if (showData) {
                message.body = body
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
                const topicInfo = {
                    topic: response.getTopic(),
                    partition: response.getPartition(),
                    offset: response.getMessage().offset,
                }
            }
        }

        return next.handle().pipe(
            catchError((err) => {
                message.errorMessage = err.message
                if (err instanceof ValidationException) {
                    message.errors = err.errors
                }
                message.time = `${Date.now() - createTime.getTime()}ms`
                this.logger.error(JSON.stringify(message))
                return throwError(() => err)
            }),
            tap((xx: any) => {
                message.time = `${Date.now() - createTime.getTime()}ms`
                this.logger.log(JSON.stringify(message))
            })
        )
    }
}
