import { Module } from '@nestjs/common'
import { ApiPurchaseOrderActionModule } from './purchase-order-action/api-purchase-order-action.module'
import { PurchaseOrderMoneyModule } from './purchase-order-money/purchase-order-money.module'
import { ApiPurchaseOrderQueryModule } from './purchase-order-query/api-purchase-order-query.module'
import { ApiPurchaseOrderReceptionModule } from './purchase-order-reception/api-purchase-order-reception.module'

@Module({
  imports: [
    ApiPurchaseOrderQueryModule,
    ApiPurchaseOrderReceptionModule,
    PurchaseOrderMoneyModule,
    ApiPurchaseOrderActionModule,
  ],
  controllers: [],
  providers: [],
})
export class ApiPurchaseOrderModule { }
