import { Controller } from '@nestjs/common'
import { Payload } from '@nestjs/microservices'
import { KafkaTopic, KAFKA_EVENT, MessageId } from '../kafka'
import { ArrivalConsumerService } from './arrival-consumer.service'
import { ArrivalCreateDto } from './dto/arrival-create.dto'

@Controller()
export class ArrivalConsumerController {
	constructor(private readonly arrivalConsumerService: ArrivalConsumerService) { }

	@KafkaTopic(KAFKA_EVENT.ADMISSION_CREATE)
	async handleArrivalCreate(@Payload() payload: ArrivalCreateDto, @MessageId() messageId: string) {
		await this.arrivalConsumerService.handleArrivalMessage({
			messageId,
			kafkaEvent: KAFKA_EVENT.ADMISSION_CREATE,
			data: payload.data,
			createdTime: payload.createdTime,
		})
	}
}
