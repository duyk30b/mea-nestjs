import { TicketProcedureResource } from '@api-public/resource/ticket-procedure/ticket-procedure.resource'
import { Module } from '@nestjs/common'
import { ApiTicketRegimenService } from '../../api-ticket-regimen/api-ticket-regimen.service'
import { ApiTicketQueryController } from './api-ticket-query.controller'
import { TicketQueryService } from './ticket-query.service'

@Module({
  imports: [],
  controllers: [ApiTicketQueryController],
  providers: [TicketProcedureResource, TicketQueryService, ApiTicketRegimenService],
  exports: [TicketQueryService],
})
export class TicketQueryModule {}
