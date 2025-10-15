import { Global, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Connection } from 'mongoose'
import { SystemLogRepository } from './collections/system-log/system-log.repository'
import { SystemLogSchema } from './collections/system-log/system-log.schema'

@Global()
@Module({
  imports: [
    MongooseModule.forRoot('mongodb://root:example@mongo:27017', {
      onConnectionCreate: (connection: Connection) => {
        connection.on('connected', () => console.debug('MongoDB connected'))
        connection.on('open', () => console.debug('MongoDB open'))
        connection.on('disconnected', () => console.debug('MongoDB disconnected'))
        connection.on('reconnected', () => console.debug('MongoDB reconnected'))
        connection.on('disconnecting', () => console.debug('MongoDB disconnecting'))

        return connection
      },
    }),
    MongooseModule.forFeature([
      { name: 'SystemLogSchema', schema: SystemLogSchema },
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
