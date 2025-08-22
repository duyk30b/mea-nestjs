import { Module } from '@nestjs/common'
import { ApiPurchaseOrderActionController } from './api-purchase-order-action.controller'
import { PurchaseOrderActionService } from './purchase-order-action.service'

@Module({
  imports: [],
  controllers: [ApiPurchaseOrderActionController],
  providers: [PurchaseOrderActionService],
})
export class ApiPurchaseOrderActionModule { }
