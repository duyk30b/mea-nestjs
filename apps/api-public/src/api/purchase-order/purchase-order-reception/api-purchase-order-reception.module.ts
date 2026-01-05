import { Module } from '@nestjs/common'
import { ApiPurchaseOrderReceptionController } from './api-purchase-order-reception.controller'
import { ApiPurchaseOrderReceptionService } from './purchase-order-reception.service'
import { PurchaseOrderBasicUpsertService } from './service/purchase-order-basic-upsert.service'

@Module({
  imports: [],
  controllers: [ApiPurchaseOrderReceptionController],
  providers: [ApiPurchaseOrderReceptionService, PurchaseOrderBasicUpsertService],
})
export class ApiPurchaseOrderReceptionModule { }
