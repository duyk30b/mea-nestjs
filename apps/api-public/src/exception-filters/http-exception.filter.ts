import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common'
import { Request, Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()
		const request = ctx.getRequest<Request>()
		const httpStatus = exception.getStatus()

		response.status(httpStatus).json({
			httpStatus,
			message: exception.getResponse(),
			path: request.url,
			timestamp: new Date().toISOString(),
		})
	}
}
