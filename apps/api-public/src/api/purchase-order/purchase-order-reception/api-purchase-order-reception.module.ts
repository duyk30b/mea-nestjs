import { Module } from '@nestjs/common'
import { ApiPurchaseOrderReceptionController } from './api-purchase-order-reception.controller'
import { ApiPurchaseOrderReceptionService } from './purchase-order-reception.service'

@Module({
  imports: [],
  controllers: [ApiPurchaseOrderReceptionController],
  providers: [ApiPurchaseOrderReceptionService],
})
export class ApiPurchaseOrderReceptionModule { }
