import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { KafkaContext, NatsContext } from '@nestjs/microservices'
import { Request, Response } from 'express'
import { Observable, throwError } from 'rxjs'
import { catchError, tap } from 'rxjs/operators'
import { ValidationException } from '../exception-filter/validation-exception.filter'

@Injectable()
export class AccessLogInterceptor implements NestInterceptor {
	constructor(private readonly logger = new Logger('ACCESS_LOG')) { }

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const createTime = Date.now()
		const className = context.getClass().name
		const funcName = context.getHandler().name
		const [req, res] = context.getArgs()

		let msgRequest = ''
		if (context.getType() === 'http') {
			const ctx = context.switchToHttp()
			const request: Request = ctx.getRequest()
			const response: Response = ctx.getResponse()

			const { url, method, body } = request

			msgRequest = `[HTTP] | ${method} | ${url} | ${className} | ${funcName}()`
				+ ` | ${JSON.stringify((request as any).external)} | ${JSON.stringify(body)} `
		}
		else if (context.getType() === 'rpc') {
			if (res.constructor.name === 'NatsContext') {
				const response: NatsContext = res
				msgRequest = `[NATS] | ${response.getSubject()} | ${className} | ${funcName}() | ${JSON.stringify(req)} `
			}
			if (res.constructor.name === 'KafkaContext') {
				const response: KafkaContext = res
				const topicInfo = {
					topic: response.getTopic(),
					partition: response.getPartition(),
					offset: response.getMessage().offset,
				}
				msgRequest = `[KAFKA] | ${JSON.stringify(topicInfo)} | ${className} | ${funcName}() | ${JSON.stringify(req)} `
			}
		}

		return next.handle().pipe(
			catchError((err) => {
				let errMessage = err.message
				if (err instanceof ValidationException) {
					errMessage = errMessage + ' ' + JSON.stringify(err.getErrors())
				}
				this.logger.error(`${msgRequest} | ${Date.now() - createTime}ms | Message: ${errMessage}`)
				return throwError(() => err)
			}),
			tap((xx: any) => {
				this.logger.log(`${msgRequest} | ${Date.now() - createTime}ms`)
			})
		)
	}
}
