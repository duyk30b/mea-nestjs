import { Module } from '@nestjs/common'
import { ApiTicketMoneyController } from './api-ticket-money.controller'
import { TicketMoneyService } from './ticket-money.service'

@Module({
  imports: [],
  controllers: [ApiTicketMoneyController],
  providers: [TicketMoneyService],
  exports: [TicketMoneyService],
})
export class TicketMoneyModule { }
