import {
    ArgumentsHost,
    Catch,
    ExceptionFilter as ExceptionFilterCommon,
    HttpStatus,
    Logger,
    NotFoundException,
} from '@nestjs/common'
import { KafkaContext, NatsContext } from '@nestjs/microservices'
import { ThrottlerException } from '@nestjs/throttler'
import { I18nTranslations } from 'assets/generated/i18n.generated'
import { Request, Response } from 'express'
import { I18nContext } from 'nestjs-i18n'
import { from } from 'rxjs'
import { BusinessException, ValidationException } from './exception'

@Catch(Error)
export class ExceptionFilter implements ExceptionFilterCommon {
    constructor(private readonly logger = new Logger(ExceptionFilter.name)) {}

    catch(exception: Error, host: ArgumentsHost) {
        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR
        let { message } = exception
        const { stack } = exception
        const errors: any[] = (exception as any).errors || []

        if (exception.name === ValidationException.name) {
            statusCode = HttpStatus.UNPROCESSABLE_ENTITY
        }
        if (exception.name === BusinessException.name) {
            const i18n = I18nContext.current<I18nTranslations>(host)
            message = i18n.translate(exception.message as any)
            statusCode = (exception as BusinessException).statusCode
        }
        if (exception.name === ThrottlerException.name) {
            statusCode = HttpStatus.TOO_MANY_REQUESTS
        }
        if (exception.name === NotFoundException.name) {
            statusCode = HttpStatus.NOT_FOUND
        }

        const [req, res] = host.getArgs()

        if (host.getType() === 'http') {
            const ctx = host.switchToHttp()
            const response = ctx.getResponse<Response>()
            const request = ctx.getRequest<Request>()

            const { originalUrl, method, body } = request
            this.logger.error(
                JSON.stringify({
                    message,
                    type: '[HTTP]',
                    method,
                    url: originalUrl,
                    errors,
                    body,
                    external: (request as any).external,
                })
            )
            response.status(statusCode).json({
                statusCode,
                errors,
                message,
                path: request.url,
            })
        } else if (host.getType() === 'rpc') {
            if (res.constructor.name === 'NatsContext') {
                // const response = host.switchToRpc().getContext<NatsContext>()
                const response: NatsContext = res
                const info: Record<string, any> = {
                    statusCode,
                    message,
                    errors,
                    details: {
                        subject: response.getSubject(),
                        request: req,
                        stack,
                    },
                }
                return from([info])
            } else if (res.constructor.name === 'KafkaContext') {
                // const response = host.switchToRpc().getContext<KafkaContext>()
                const response: KafkaContext = res
                const info: Record<string, any> = {
                    statusCode,
                    message,
                    errors,
                    details: {
                        topic: response.getTopic(),
                        partition: response.getPartition(),
                        offset: response.getMessage().offset,
                        request: req,
                    },
                }
                return from([info])
            }
        }
    }
}
