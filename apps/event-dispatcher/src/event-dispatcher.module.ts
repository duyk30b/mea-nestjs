import { Module, ValidationError, ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_PIPE } from '@nestjs/core'
import { BullQueueModule } from '_libs/redis'
import { ArrivalConsumerModule } from './arrival-consumer/arrival-consumer.module'
import { AuthConsumerModule } from './auth-consumer/auth-consumer.module'
import { KafkaConsumerModule, KafkaException, KafkaExceptionFilter } from './kafka'

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: [`.env.${process.env.NODE_ENV || 'local'}`, '.env'],
			isGlobal: true,
		}),
		BullQueueModule.forRoot(),
		KafkaConsumerModule,
		AuthConsumerModule,
		ArrivalConsumerModule,
	],
	controllers: [],
	providers: [
		{
			provide: APP_PIPE,
			useValue: new ValidationPipe({
				validationError: { target: false, value: true },
				skipMissingProperties: true, // no validate field undefined
				whitelist: true,
				transform: true, // use for DTO
				transformOptions: {
					excludeExtraneousValues: true, // exclude field not in class DTO => no
					exposeUnsetFields: false, // expose field undefined in DTO => no
				},
				exceptionFactory: (errors: ValidationError[] = []) => {
					return new KafkaException(errors, 'KAFKA_VALIDATE_DATA_FAILED')
				},
			}),
		},
		{
			provide: APP_FILTER,
			useClass: KafkaExceptionFilter,
		},
	],
})
export class EventDispatcherModule { }
