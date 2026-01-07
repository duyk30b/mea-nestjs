import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { SystemLogRepository } from './collections/system-log/system-log.repository'
import { SystemLog, SystemLogSchema } from './collections/system-log/system-log.schema'
import MongodbConfigService, { MongoDbConfig } from './mongodb.config'

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule.forFeature(MongoDbConfig)],
      inject: [MongoDbConfig.KEY],
      useClass: MongodbConfigService,
    }),
    MongooseModule.forFeature([
      { name: SystemLog.name, schema: SystemLogSchema },
      // { name: ItemMovement.name, schema: ItemMovementSchema },
      // { name: ItemKeep.name, schema: ItemKeepSchema },
    ]),
  ],
  providers: [
    SystemLogRepository,
    // ItemMovementRepository,
    // ItemKeepRepository,
  ],
  exports: [
    SystemLogRepository,
    // ItemMovementRepository,
    // ItemKeepRepository,
  ],
})
export class MongoDbConnectModule { }
