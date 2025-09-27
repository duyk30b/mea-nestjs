import { Module } from '@nestjs/common'
import { TicketReceptionController } from './ticket-reception.controller'
import { TicketReceptionService } from './ticket-reception.service'

@Module({
  imports: [],
  controllers: [TicketReceptionController],
  providers: [TicketReceptionService],
})
export class TicketReceptionModule { }
