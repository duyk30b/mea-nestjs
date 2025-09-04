import { Module } from '@nestjs/common'
import { ApiTicketProcedureService } from '../../api-ticket-procedure/api-ticket-procedure.service'
import { TicketChangeProcedureController } from './ticket-change-procedure.controller'
import { TicketChangeProcedureService } from './ticket-change-procedure.service'

@Module({
  imports: [],
  controllers: [TicketChangeProcedureController],
  providers: [TicketChangeProcedureService, ApiTicketProcedureService],
  exports: [TicketChangeProcedureService],
})
export class TicketChangeProcedureModule { }
