import { Injectable } from '@nestjs/common/decorators'
import { ConfigService } from '@nestjs/config'
import { MessagePattern } from '@nestjs/microservices'
import { KAFKA_TOPIC_METADATA } from './kafka.config'

@Injectable()
export class KafkaConsumerService {
	constructor(private readonly configService: ConfigService) { }

	processKafkaDecorators(types: any[]) {
		for (const type of types) {
			const propNames = Object.getOwnPropertyNames(type.prototype)
			for (const prop of propNames) {
				const eventConfig = Reflect.getMetadata(KAFKA_TOPIC_METADATA, Reflect.get(type.prototype, prop))
				if (!eventConfig) continue

				const topic = this.configService.get<string>(eventConfig)
				Reflect.decorate(
					[MessagePattern(topic)],
					type.prototype,
					prop,
					Reflect.getOwnPropertyDescriptor(type.prototype, prop)
				)
			}
		}
	}
}
