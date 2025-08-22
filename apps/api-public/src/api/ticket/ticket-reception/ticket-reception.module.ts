import { Module } from '@nestjs/common'
import { TicketChangeUserModule } from '../ticket-change-user/ticket-change-user.module'
import { ApiTicketReceptionController } from './api-ticket-reception.controller'
import { TicketReceptionService } from './ticket-reception.service'

@Module({
  imports: [TicketChangeUserModule],
  controllers: [ApiTicketReceptionController],
  providers: [TicketReceptionService],
})
export class TicketReceptionModule { }
