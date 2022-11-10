import { ArgumentsHost, Catch, Logger, RpcExceptionFilter, ValidationError } from '@nestjs/common'
import { KafkaContext, RpcException } from '@nestjs/microservices'
import { from, Observable } from 'rxjs'

export class KafkaException extends RpcException {
	private readonly title: string

	constructor(error: string | Record<string, unknown> | ValidationError[], title?: string) {
		super(error)
		this.title = title
	}

	getTitle() {
		return this.title
	}
}

@Catch(KafkaException)
export class KafkaExceptionFilter implements RpcExceptionFilter<KafkaException> {
	private logger = new Logger(KafkaExceptionFilter.name)

	catch(exception: KafkaException, host: ArgumentsHost): Observable<any> {
		const ctx = host.switchToRpc().getContext<KafkaContext>()

		const info = {
			title: exception.getTitle(),
			error: exception.getError(),
			message: ctx.getMessage(),
		}
		this.logger.error(info)

		return from([info])
	}
}
