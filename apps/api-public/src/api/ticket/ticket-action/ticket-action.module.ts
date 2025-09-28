import { Module } from '@nestjs/common'
import { TicketQueryModule } from '../ticket-query/ticket-query.module'
import { TicketActionController } from './ticket-action.controller'
import { TicketActionService } from './ticket-action.service'
import { TicketDestroyService } from './ticket-destroy.service'

@Module({
  imports: [TicketQueryModule],
  controllers: [TicketActionController],
  providers: [TicketActionService, TicketDestroyService],
  exports: [TicketActionService, TicketDestroyService],
})
export class TicketActionModule { }
