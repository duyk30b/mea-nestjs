import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { BullQueueModule } from '_libs/redis'
import { AuthConsumerController } from './auth-consumer.controller'
import { AuthConsumerService } from './auth-consumer.service'

@Module({
	imports: [
		ConfigModule,
		BullQueueModule.registerProducer(),
	],
	controllers: [AuthConsumerController],
	providers: [AuthConsumerService],
})
export class AuthConsumerModule { }
