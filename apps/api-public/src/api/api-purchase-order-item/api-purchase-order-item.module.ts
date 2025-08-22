import { Module } from '@nestjs/common'
import { ApiPurchaseOrderItemController } from './api-purchase-order-item.controller'
import { ApiPurchaseOrderItemService } from './api-purchase-order-item.service'

@Module({
  imports: [],
  controllers: [ApiPurchaseOrderItemController],
  providers: [ApiPurchaseOrderItemService],
})
export class ApiPurchaseOrderItemModule { }
