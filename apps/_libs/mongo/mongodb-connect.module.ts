import { Global, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import MongodbConfigService from './mongodb.config'

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({ useClass: MongodbConfigService }),
    MongooseModule.forFeature([
      // { name: ItemStock.name, schema: ItemStockSchema },
      // { name: ItemMovement.name, schema: ItemMovementSchema },
      // { name: ItemKeep.name, schema: ItemKeepSchema },
    ]),
  ],
  providers: [
    // ItemStockRepository,
    // ItemMovementRepository,
    // ItemKeepRepository,
  ],
  exports: [
    // ItemStockRepository,
    // ItemMovementRepository,
    // ItemKeepRepository,
  ],
})
export class MongoDbConnectModule {}
