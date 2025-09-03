import { Module } from '@nestjs/common'
import { ApiTicketProcedureService } from '../../api-ticket-procedure/api-ticket-procedure.service'
import { TicketChangeUserModule } from '../ticket-change-user/ticket-change-user.module'
import { TicketChangeProcedureController } from './ticket-change-procedure.controller'
import { TicketChangeProcedureService } from './ticket-change-procedure.service'

@Module({
  imports: [TicketChangeUserModule],
  controllers: [TicketChangeProcedureController],
  providers: [TicketChangeProcedureService, ApiTicketProcedureService],
  exports: [TicketChangeProcedureService],
})
export class TicketChangeProcedureModule { }
