import { Module } from '@nestjs/common'
import { TicketAddTicketProcedureListService } from './service/ticket-add-ticket-procedure-list.service'
import { TicketCancelResultTicketProcedureService } from './service/ticket-cancel-result-ticket-procedure.service'
import { TicketChangeProcedureService } from './service/ticket-change-procedure.service'
import { TicketChangeRegimenService } from './service/ticket-change-regimen.service'
import { TicketDestroyTicketProcedureService } from './service/ticket-destroy-ticket-procedure.service'
import { TicketDestroyTicketRegimenService } from './service/ticket-destroy-ticket-regimen.service'
import { TicketProcessResultTicketProcedureService } from './service/ticket-process-result-ticket-procedure.service'
import { TicketUpdateUserTicketProcedureService } from './service/ticket-update-user-ticket-procedure.service'
import { TicketChangeProcedureController } from './ticket-change-procedure.controller'

@Module({
  imports: [],
  controllers: [TicketChangeProcedureController],
  providers: [
    TicketAddTicketProcedureListService,
    TicketChangeProcedureService,
    TicketUpdateUserTicketProcedureService,
    TicketChangeRegimenService,
    TicketProcessResultTicketProcedureService,
    TicketCancelResultTicketProcedureService,
    TicketDestroyTicketProcedureService,
    TicketDestroyTicketRegimenService,
  ],
  exports: [TicketAddTicketProcedureListService],
})
export class TicketChangeProcedureModule { }
