import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger, ValidationError } from '@nestjs/common'
import { KafkaContext, NatsContext } from '@nestjs/microservices'
import { Request, Response } from 'express'
import { from } from 'rxjs'

export class ValidationException extends Error {
	private readonly errors: ValidationError[]
	constructor(validationErrors: ValidationError[] = []) {
		super('Validate Failed')
		this.errors = validationErrors
	}

	getMessage() {
		return this.message
	}

	getErrors() {
		return this.errors
	}
}

@Catch(ValidationException)
export class ValidationExceptionFilter implements ExceptionFilter {
	private logger = new Logger(ValidationExceptionFilter.name)

	catch(exception: ValidationException, host: ArgumentsHost) {
		const statusCode = HttpStatus.UNPROCESSABLE_ENTITY
		const message = exception.getMessage()
		const errors = exception.getErrors()
		const [req, res] = host.getArgs()

		if (host.getType() === 'http') {
			const ctx = host.switchToHttp()
			const response = ctx.getResponse<Response>()
			const request = ctx.getRequest<Request>()

			response.status(statusCode).json({
				statusCode,
				message,
				errors,
				path: request.url,
				timestamp: new Date().toISOString(),
			})
		}
		else if (host.getType() === 'rpc') {
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
					},
				}
				return from([info])
			}

			else if (res.constructor.name === 'KafkaContext') {
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
