import { Module } from '@nestjs/common'
import { ApiTicketMoneyController } from './api-ticket-money.controller'
import { TicketPrepaymentTicketItemListService } from './service/ticket-prepayment-ticket-item-list.service'
import { TicketRefundTicketItemListService } from './service/ticket-refund-ticket-item-list.service'
import { TicketMoneyService } from './ticket-money.service'

@Module({
  imports: [],
  controllers: [ApiTicketMoneyController],
  providers: [
    TicketMoneyService,
    TicketPrepaymentTicketItemListService,
    TicketRefundTicketItemListService,
  ],
  exports: [TicketMoneyService],
})
export class TicketMoneyModule { }
