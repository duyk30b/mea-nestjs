import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { BullQueueModule } from '_libs/redis'
import { KafkaJobModule } from './kafka-job/kafka-job.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: [`.env.${process.env.NODE_ENV || 'local'}`, '.env'],
			isGlobal: true,
		}),
		BullQueueModule.forRoot(),
		KafkaJobModule,
	],
})
export class WorkerModule { }
