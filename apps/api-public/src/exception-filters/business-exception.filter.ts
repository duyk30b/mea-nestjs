import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common'
import { Request, Response } from 'express'

export class BusinessException extends Error {
	constructor(message: string) {
		super(message)
	}
}

@Catch(BusinessException)
export class BusinessExceptionFilter implements ExceptionFilter {
	catch(exception: BusinessException, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()
		const request = ctx.getRequest<Request>()
		const httpStatus = HttpStatus.BAD_REQUEST
		const { message } = exception

		response.status(httpStatus).json({
			httpStatus,
			message,
			path: request.url,
			timestamp: new Date().toISOString(),
		})
	}
}
