import { Module } from '@nestjs/common'
import { TicketQueryModule } from '../ticket-query/ticket-query.module'
import { TicketChangeAllMoneyService } from './service/ticket-change-all-money.service'
import { TicketActionController } from './ticket-action.controller'
import { TicketActionService } from './ticket-action.service'
import { TicketDestroyService } from './ticket-destroy.service'

@Module({
  imports: [TicketQueryModule],
  controllers: [TicketActionController],
  providers: [
    TicketActionService,
    TicketDestroyService,
    TicketChangeAllMoneyService,
  ],
  exports: [TicketActionService, TicketDestroyService],
})
export class TicketActionModule { }
