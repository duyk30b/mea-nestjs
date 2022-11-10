import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { BullQueueModule } from '_libs/redis'
import { ArrivalConsumerService } from './arrival-consumer.service'
import { ArrivalConsumerController } from './arrival-consumer.controller'

@Module({
	imports: [
		ConfigModule,
		BullQueueModule.registerProducer(),
	],
	controllers: [ArrivalConsumerController],
	providers: [ArrivalConsumerService],
})
export class ArrivalConsumerModule { }
