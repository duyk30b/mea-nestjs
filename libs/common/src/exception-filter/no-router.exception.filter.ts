import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger, NotFoundException } from '@nestjs/common'
import { Request, Response } from 'express'

@Catch(NotFoundException)
export class NoRouterExceptionFilter implements ExceptionFilter {
    constructor(private readonly logger = new Logger(NoRouterExceptionFilter.name)) {}

    catch(exception: Error, host: ArgumentsHost) {
        const statusCode = HttpStatus.NOT_FOUND

        if (host.getType() === 'http') {
            const ctx = host.switchToHttp()
            const response = ctx.getResponse<Response>()
            const request = ctx.getRequest<Request>()

            const { originalUrl, method, body } = request
            const externalStr = JSON.stringify((request as any).external)
            const bodyStr = JSON.stringify(body)
            this.logger.error(`[HTTP] | ${method} | ${originalUrl} | ${externalStr} | ${bodyStr} `)

            response.status(statusCode).json({
                statusCode,
                message: exception.message,
                path: request.url,
            })
        }
    }
}
