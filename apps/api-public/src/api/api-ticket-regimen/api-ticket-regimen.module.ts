import { Module } from '@nestjs/common'
import { ApiTicketProcedureService } from '../api-ticket-procedure/api-ticket-procedure.service'
import { ApiTicketRegimenController } from './api-ticket-regimen.controller'
import { ApiTicketRegimenService } from './api-ticket-regimen.service'

@Module({
  imports: [],
  controllers: [ApiTicketRegimenController],
  providers: [ApiTicketRegimenService, ApiTicketProcedureService],
  exports: [ApiTicketRegimenService],
})
export class ApiTicketRegimenModule { }
