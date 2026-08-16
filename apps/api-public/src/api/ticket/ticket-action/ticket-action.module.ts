import { Module } from '@nestjs/common'
import { TicketQueryModule } from '../ticket-query/ticket-query.module'
import { TicketChangeAllMoneyService } from './service/ticket-change-all-money.service'
import { TicketActionController } from './ticket-action.controller'
import { TicketActionService } from './ticket-action.service'
import { TicketCancelService } from './ticket-cancel.service'

@Module({
  imports: [TicketQueryModule],
  controllers: [TicketActionController],
  providers: [TicketActionService, TicketCancelService, TicketChangeAllMoneyService],
  exports: [TicketActionService, TicketCancelService],
})
export class TicketActionModule {}
