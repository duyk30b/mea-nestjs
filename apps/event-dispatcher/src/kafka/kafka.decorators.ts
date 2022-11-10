import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { KafkaContext } from '@nestjs/microservices'
import { KAFKA_TOPIC_METADATA } from './kafka.config'

// https://github.com/nestjs/nest/issues/3912
export function KafkaTopic(config: string) {
	return (target: any, key: string | symbol, descriptor: PropertyDescriptor) => {
		Reflect.defineMetadata(KAFKA_TOPIC_METADATA, config, descriptor.value)
		return descriptor
	}
}

export const MessageId = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	const kafkaContext = ctx.switchToRpc().getContext() as KafkaContext
	const topic = kafkaContext.getTopic()
	const partition = kafkaContext.getPartition()
	const { offset } = kafkaContext.getMessage()

	return `topic_${topic}_partition_${partition}_offset_${offset}`
})
