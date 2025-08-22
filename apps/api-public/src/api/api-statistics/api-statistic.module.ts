import { Module } from '@nestjs/common'
import { ApiStatisticLaboratoryService } from './api-statistic-laboratory.service'
import { ApiStatisticPurchaseOrderService } from './api-statistic-purchase-order.service'
import { ApiStatisticRadiologyService } from './api-statistic-radiology.service'
import { ApiStatisticTicketService } from './api-statistic-ticket.service'
import { ApiStatisticController } from './api-statistic.controller'
import { ApiStatisticService } from './api-statistic.service'

@Module({
  imports: [],
  controllers: [ApiStatisticController],
  providers: [
    ApiStatisticService,
    ApiStatisticPurchaseOrderService,
    ApiStatisticTicketService,
    ApiStatisticLaboratoryService,
    ApiStatisticRadiologyService,
  ],
})
export class ApiStatisticModule { }
