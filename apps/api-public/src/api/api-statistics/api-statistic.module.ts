import { Module } from '@nestjs/common'
import { ApiStatisticReceiptService } from './api-statistic-receipt.service'
import { ApiStatisticTicketService } from './api-statistic-ticket.service'
import { ApiStatisticController } from './api-statistic.controller'
import { ApiStatisticService } from './api-statistic.service'

@Module({
  imports: [],
  controllers: [ApiStatisticController],
  providers: [ApiStatisticService, ApiStatisticReceiptService, ApiStatisticTicketService],
})
export class ApiStatisticModule { }
