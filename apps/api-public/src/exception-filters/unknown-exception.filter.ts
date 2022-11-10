import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common'
import { Request, Response } from 'express'

@Catch(Error)
export class UnknownExceptionFilter implements ExceptionFilter {
	constructor(private readonly logger = new Logger('SERVER_ERROR')) { }

	catch(exception: Error, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()
		const request = ctx.getRequest<Request>()
		const httpStatus = HttpStatus.INTERNAL_SERVER_ERROR

		this.logger.error(exception.stack)

		response.status(httpStatus).json({
			httpStatus,
			message: exception.message,
			path: request.url,
			timestamp: new Date().toISOString(),
		})
	}
}
