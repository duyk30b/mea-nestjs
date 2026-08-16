import { Module } from '@nestjs/common'
import { ApiPurchaseOrderActionController } from './api-purchase-order-action.controller'
import { PurchaseOrderActionService } from './purchase_order_action.service'
import { PurchaseOrderCancelService } from './purchase_order_cancel.service'

@Module({
  imports: [],
  controllers: [ApiPurchaseOrderActionController],
  providers: [PurchaseOrderActionService, PurchaseOrderCancelService],
})
export class ApiPurchaseOrderActionModule {}
