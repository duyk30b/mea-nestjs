import { Injectable, Logger } from '@nestjs/common'
import { BullQueueService, IKafkaJob } from '_libs/redis'

@Injectable()
export class ArrivalConsumerService {
	private readonly logger = new Logger(ArrivalConsumerService.name)

	constructor(private readonly bullQueueService: BullQueueService) { }

	async handleArrivalMessage(data: IKafkaJob) {
		this.logger.log(`handleArrivalMessage: ${JSON.stringify(data)}`)

		this.bullQueueService.addKafkaJob(data)
	}
}
