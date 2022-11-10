import { Injectable, Logger } from '@nestjs/common'
import { BullQueueService, IKafkaJob } from '_libs/redis'

@Injectable()
export class AuthConsumerService {
	private readonly logger = new Logger(AuthConsumerService.name)

	constructor(private readonly bullQueueService: BullQueueService) { }

	async handleAuthMessage(data: IKafkaJob) {
		this.logger.log(`handleAuthMessage: ${JSON.stringify(data)}`)

		this.bullQueueService.addKafkaJob(data)
	}
}
