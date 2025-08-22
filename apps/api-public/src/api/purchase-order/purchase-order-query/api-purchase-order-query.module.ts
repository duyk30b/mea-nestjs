import { Module } from '@nestjs/common'
import { ApiPurchaseOrderQueryController } from './api-purchase-order-query.controller'
import { ApiPurchaseOrderQueryService } from './purchase-order-query.service'

@Module({
  imports: [],
  controllers: [ApiPurchaseOrderQueryController],
  providers: [ApiPurchaseOrderQueryService],
})
export class ApiPurchaseOrderQueryModule { }
