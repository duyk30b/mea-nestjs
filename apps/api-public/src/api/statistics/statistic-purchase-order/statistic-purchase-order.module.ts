import { Module } from '@nestjs/common'
import { StatisticPurchaseOrderController } from './statistic-purchase-order.controller'
import { StatisticPurchaseOrderService } from './statistic-purchase-order.service'

@Module({
  imports: [],
  controllers: [StatisticPurchaseOrderController],
  providers: [StatisticPurchaseOrderService],
})
export class StatisticPurchaseOrderModule { }
