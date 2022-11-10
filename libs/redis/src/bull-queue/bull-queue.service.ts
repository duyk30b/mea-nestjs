import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bull'
import { IKafkaJob, ITestJob } from './bull-queue.interface'
import { QUEUE_EVENT } from './bull-queue.variable'

@Injectable()
export class BullQueueService {
	constructor(
		@InjectQueue(QUEUE_EVENT.TEST_JOB) private readonly testJobQueue: Queue,
		@InjectQueue(QUEUE_EVENT.KAFKA_JOB) private readonly kafkaJobQueue: Queue
	) { }

	async addTestJob(data: ITestJob) {
		await this.testJobQueue.add(data)
	}

	async addKafkaJob(data: IKafkaJob) {
		await this.kafkaJobQueue.add(data)
	}
}
