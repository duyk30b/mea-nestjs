// import { Logger } from '@nestjs/common'
// import { ConfigService } from '@nestjs/config'
// import { NestFactory } from '@nestjs/core'
// import { MicroserviceOptions } from '@nestjs/microservices'
// import { Transport } from '@nestjs/microservices/enums'
// import { Partitioners } from 'kafkajs'
// import { getAllControllers } from '../../../libs/common/src/helpers/process.helper'
// import { EventDispatcherModule } from './event-dispatcher.module'
// import { KafkaConsumerService } from './kafka'

// declare const module: any

// async function bootstrap() {
//     const logger = new Logger('bootstrap')

//     const app = await NestFactory.createMicroservice<MicroserviceOptions>(EventDispatcherModule, {
//         transport: Transport.KAFKA,
//         options: {
//             client: {
//                 clientId: process.env.KAFKA_GROUP_ID + '-client',
//                 brokers: [process.env.KAFKA_BROKERS],
//             },
//             consumer: {
//                 groupId: process.env.KAFKA_GROUP_ID,
//                 allowAutoTopicCreation: true,
//             },
//             producer: { createPartitioner: Partitioners.LegacyPartitioner },
//         },
//     })

//     app.get(KafkaConsumerService).processKafkaDecorators(getAllControllers(app))
//     app.useLogger(['log', 'error', 'warn', 'debug', 'verbose'])

//     const configService = app.get(ConfigService)
//     const NODE_ENV = configService.get<string>('NODE_ENV')

//     if (NODE_ENV === 'local') {
//         if (module.hot) {
//             module.hot.accept()
//             module.hot.dispose(() => app.close())
//         }
//     }

//     await app.listen()
//     logger.debug('🚀 ===== [KAFKA]: Service event-dispatcher started =====')
// }
// bootstrap()
