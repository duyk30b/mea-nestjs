import { Module } from '@nestjs/common'
import { TicketActionController } from './ticket-action.controller'
import { TicketActionService } from './ticket-action.service'

@Module({
  imports: [],
  controllers: [TicketActionController],
  providers: [TicketActionService],
})
export class TicketActionModule { }
