import { BullModule, BullModuleOptions } from '@nestjs/bull'
import { DynamicModule, Module } from '@nestjs/common'
import { ConfigModule, ConfigType } from '@nestjs/config'
import Bull from 'bull'
import { RedisConfig } from '../redis.config'
import { BullQueueService } from './bull-queue.service'
import { QUEUE_EVENT } from './bull-queue.variable'

const QUEUES: BullModuleOptions[] = [
	{ name: QUEUE_EVENT.TEST_JOB },
	{ name: QUEUE_EVENT.KAFKA_JOB },
]

@Module({})
export class BullQueueModule {
	static forRoot(): DynamicModule {
		return {
			module: BullQueueModule,
			imports: [
				ConfigModule.forFeature(RedisConfig),
				BullModule.forRootAsync({
					imports: [ConfigModule.forFeature(RedisConfig)],
					inject: [RedisConfig.KEY],
					useFactory: async (redisConfig: ConfigType<typeof RedisConfig>) => {
						const bullConfig: Bull.QueueOptions = {
							redis: {
								host: redisConfig.host,
								port: redisConfig.port,
								db: +redisConfig.db,
							},
							defaultJobOptions: { removeOnComplete: true },
						}
						return bullConfig
					},
				}),
			],
		}
	}

	static registerProducer(): DynamicModule {
		const base = BullQueueModule.register()
		base.providers = [...(base.providers || []), BullQueueService]
		base.exports = [...(base.exports || []), BullQueueService]
		return base
	}

	static registerConsumer(): DynamicModule {
		return BullQueueModule.register()
	}

	private static register(): DynamicModule {
		return {
			module: BullQueueModule,
			imports: [BullModule.registerQueue(...QUEUES)],
		}
	}
}
