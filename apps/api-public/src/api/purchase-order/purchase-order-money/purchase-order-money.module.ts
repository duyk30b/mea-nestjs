import { Module } from '@nestjs/common'
import { ApiPurchaseOrderMoneyController } from './api-purchase-order-money.controller'
import { PurchaseOrderMoneyService } from './purchase-order-money.service'

@Module({
  imports: [],
  controllers: [ApiPurchaseOrderMoneyController],
  providers: [PurchaseOrderMoneyService],
})
export class PurchaseOrderMoneyModule { }
