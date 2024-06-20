import { Module } from '@nestjs/common'
import { ApiStatisticInvoiceService } from './api-statistic-invoice.service'
import { ApiStatisticReceiptService } from './api-statistic-receipt.service'
import { ApiStatisticVisitService } from './api-statistic-visit.service'
import { ApiStatisticController } from './api-statistic.controller'
import { ApiStatisticService } from './api-statistic.service'

@Module({
  imports: [],
  controllers: [ApiStatisticController],
  providers: [
    ApiStatisticService,
    ApiStatisticReceiptService,
    ApiStatisticInvoiceService,
    ApiStatisticVisitService,
  ],
})
export class ApiStatisticModule {}
