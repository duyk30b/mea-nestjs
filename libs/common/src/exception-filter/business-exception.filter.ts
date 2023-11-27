import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common'
import { KafkaContext, NatsContext } from '@nestjs/microservices'
import { I18nPath, I18nTranslations } from 'assets/generated/i18n.generated'
import { Request, Response } from 'express'
import { I18nContext } from 'nestjs-i18n'
import { from } from 'rxjs'

export class BusinessException extends Error {
    public statusCode: HttpStatus

    constructor(message: I18nPath, statusCode = HttpStatus.BAD_REQUEST) {
        super(message)
        this.statusCode = statusCode
    }
}

@Catch(BusinessException)
export class BusinessExceptionFilter implements ExceptionFilter {
    constructor(private readonly authLogger = new Logger('Authenticate')) {}

    catch(exception: BusinessException, host: ArgumentsHost) {
        const [req, res] = host.getArgs()
        const { statusCode } = exception

        const i18n = I18nContext.current<I18nTranslations>(host)
        const message = i18n.translate(exception.message as any)

        if (host.getType() === 'http') {
            const ctx = host.switchToHttp()
            const response = ctx.getResponse<Response>()
            const request = ctx.getRequest<Request>()

            if (statusCode === HttpStatus.UNAUTHORIZED) {
                const { originalUrl, method, body } = request
                const externalStr = JSON.stringify((request as any).external)
                const bodyStr = JSON.stringify(body)
                this.authLogger.error(`[HTTP] | ${method} | ${originalUrl} | ${externalStr} | ${bodyStr} `)
            }

            response.status(statusCode).json({
                statusCode,
                message,
                path: request.originalUrl,
            })
        } else if (host.getType() === 'rpc') {
            if (res.constructor.name === 'NatsContext') {
                const response: NatsContext = res

                const info: Record<string, any> = {
                    statusCode,
                    message,
                    details: {
                        subject: response.getSubject(),
                        request: req,
                    },
                }
                return from([info])
            }
            if (res.constructor.name === 'KafkaContext') {
                const response: KafkaContext = res

                const info: Record<string, any> = {
                    statusCode,
                    message,
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
