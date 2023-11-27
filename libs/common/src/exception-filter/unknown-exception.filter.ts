import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common'
import { KafkaContext, NatsContext } from '@nestjs/microservices'
import { Request, Response } from 'express'
import { from } from 'rxjs'

@Catch(Error)
export class UnknownExceptionFilter implements ExceptionFilter {
    constructor(private readonly logger = new Logger(UnknownExceptionFilter.name)) {}

    catch(exception: Error, host: ArgumentsHost) {
        console.error(exception)
        const statusCode = HttpStatus.INTERNAL_SERVER_ERROR
        const { message, stack } = exception
        const [req, res] = host.getArgs()

        if (host.getType() === 'http') {
            const ctx = host.switchToHttp()
            const response = ctx.getResponse<Response>()
            const request = ctx.getRequest<Request>()

            response.status(statusCode).json({
                statusCode,
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
