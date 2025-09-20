import { Module } from '@nestjs/common'
import { TicketQueryModule } from '../ticket-query/ticket-query.module'
import { TicketActionController } from './ticket-action.controller'
import { TicketActionService } from './ticket-action.service'

@Module({
  imports: [TicketQueryModule],
  controllers: [TicketActionController],
  providers: [TicketActionService],
  exports: [TicketActionService],
})
export class TicketActionModule { }
