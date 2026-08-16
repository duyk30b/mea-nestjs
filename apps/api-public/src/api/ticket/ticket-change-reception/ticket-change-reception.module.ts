import { Module } from '@nestjs/common'
import { TicketCancelService } from '../ticket-action/ticket-cancel.service'
import { TicketChangeProcedureModule } from '../ticket-change-procedure/ticket-change-procedure.module'
import { TicketChangeUserModule } from '../ticket-change-user/ticket-change-user.module'
import { TicketChangeReceptionController } from './ticket-change-reception.controller'
import { TicketChangeReceptionService } from './ticket-change-reception.service'

@Module({
  imports: [TicketChangeProcedureModule, TicketChangeUserModule],
  controllers: [TicketChangeReceptionController],
  providers: [TicketChangeReceptionService, TicketCancelService],
})
export class TicketChangeReceptionModule {}
