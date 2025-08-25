import { Module } from '@nestjs/common'
import { StatisticCustomerModule } from './statistic-customer/statistic-customer.module'
import { StatisticLaboratoryModule } from './statistic-laboratory/statistic-laboratory.module'
import { StatisticProcedureModule } from './statistic-procedure/statistic-procedure.module'
import { StatisticProductModule } from './statistic-product/statistic-product.module'
import { StatisticPurchaseOrderModule } from './statistic-purchase-order/statistic-purchase-order.module'
import { StatisticRadiologyModule } from './statistic-radiology/statistic-radiology.module'
import { StatisticTicketModule } from './statistic-ticket/statistic-ticket.module'

@Module({
  imports: [
    StatisticCustomerModule,
    StatisticLaboratoryModule,
    StatisticProcedureModule,
    StatisticProductModule,
    StatisticPurchaseOrderModule,
    StatisticRadiologyModule,
    StatisticTicketModule,
  ],
  controllers: [],
  providers: [],
})
export class StatisticModule { }
