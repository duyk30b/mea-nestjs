import { Module } from '@nestjs/common'
import { ApiTicketProcedureService } from '../../api-ticket-procedure/api-ticket-procedure.service'
import { ApiTicketRadiologyService } from '../../api-ticket-radiology/api-ticket-radiology.service'
import { ApiTicketRegimenService } from '../../api-ticket-regimen/api-ticket-regimen.service'
import { ApiTicketQueryController } from './api-ticket-query.controller'
import { TicketQueryService } from './ticket-query.service'

@Module({
  imports: [],
  controllers: [ApiTicketQueryController],
  providers: [
    TicketQueryService,
    ApiTicketProcedureService,
    ApiTicketRadiologyService,
    ApiTicketRegimenService,
  ],
  exports: [TicketQueryService],
})
export class TicketQueryModule { }
