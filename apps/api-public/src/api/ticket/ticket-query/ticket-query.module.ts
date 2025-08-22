import { Module } from '@nestjs/common'
import { ApiTicketProcedureService } from '../../api-ticket-procedure/api-ticket-procedure.service'
import { ApiTicketQueryController } from './api-ticket-query.controller'
import { TicketQueryService } from './ticket-query.service'

@Module({
  imports: [],
  controllers: [ApiTicketQueryController],
  providers: [TicketQueryService, ApiTicketProcedureService],
})
export class TicketQueryModule { }
