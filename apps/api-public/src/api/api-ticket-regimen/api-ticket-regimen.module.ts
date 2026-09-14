import { TicketProcedureResource } from '@api-public/resource/ticket-procedure/ticket-procedure.resource'
import { Module } from '@nestjs/common'
import { ApiTicketRegimenController } from './api-ticket-regimen.controller'
import { ApiTicketRegimenService } from './api-ticket-regimen.service'

@Module({
  imports: [],
  controllers: [ApiTicketRegimenController],
  providers: [TicketProcedureResource, ApiTicketRegimenService],
  exports: [ApiTicketRegimenService],
})
export class ApiTicketRegimenModule {}
