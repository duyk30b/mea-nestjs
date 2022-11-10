import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { Request, Response } from 'express'
import { getClientIp } from 'request-ip'
import { Observable, throwError } from 'rxjs'
import { catchError, tap } from 'rxjs/operators'
import { ValidationException } from '../exception-filters/validation-exception.filter'

@Injectable()
export class AccessLogInterceptor implements NestInterceptor {
	constructor(private readonly logger = new Logger('ACCESS_LOG')) { }

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const createTime = new Date()
		const ctx = context.switchToHttp()
		const request: Request = ctx.getRequest()
		const response: Response = ctx.getResponse()

		const { url, method, body } = request
		const { statusCode } = response
		const ip = getClientIp(request)

		return next.handle().pipe(
			catchError((err) => {
				let errMessage = err.message
				if (err instanceof ValidationException) {
					errMessage = errMessage + ' ' + JSON.stringify(err.getErrors())
				}
				const msg = `[ERROR] ${createTime.toISOString()} | ${ip} | ${method} | ${statusCode} | ${url}`
					+ ` | ${JSON.stringify(body)} | ${Date.now() - createTime.getTime()}ms | Message: ${errMessage}`
				this.logger.log(msg)
				return throwError(() => err)
			}),
			tap(() => {
				const msg = `${createTime.toISOString()} | ${ip} | ${method} | ${statusCode} | ${url}`
					+ ` | ${JSON.stringify(body)} | ${Date.now() - createTime.getTime()}ms`
				return this.logger.log(msg)
			})
		)
	}
}
