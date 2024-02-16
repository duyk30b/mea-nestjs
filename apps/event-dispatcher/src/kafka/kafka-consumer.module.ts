import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { KafkaConsumerService } from './kafka-consumer.service'
import { KafkaConfig } from './kafka.config'

@Module({
  imports: [ConfigModule.forFeature(KafkaConfig)],
  providers: [KafkaConsumerService],
})
export class KafkaConsumerModule {}
