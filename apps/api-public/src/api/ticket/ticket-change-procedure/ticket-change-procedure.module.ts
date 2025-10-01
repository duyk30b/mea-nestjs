import { Module } from '@nestjs/common'
import { TicketAddTicketProcedureListService } from './service/ticket-add-ticket-procedure-list.service'
import { TicketDestroyTicketProcedureService } from './service/ticket-destroy-ticket-procedure.service'
import { TicketDestroyTicketRegimenService } from './service/ticket-destroy-ticket-regimen.service'
import { TicketProcessResultTicketProcedureService } from './service/ticket-process-result-ticket-procedure.service'
import { TicketUpdateMoneyTicketProcedureService } from './service/ticket-update-money-ticket-procedure.service'
import { TicketUpdateMoneyTicketRegimenService } from './service/ticket-update-money-ticket-regimen.service'
import { TicketUpdateUserTicketProcedureService } from './service/ticket-update-user-ticket-procedure.service'
import { TicketUpdateUserTicketRegimenOperation } from './service/ticket-update-user-ticket-regimen.service'
import { TicketChangeProcedureController } from './ticket-change-procedure.controller'

@Module({
  imports: [],
  controllers: [TicketChangeProcedureController],
  providers: [
    TicketAddTicketProcedureListService,
    TicketUpdateMoneyTicketProcedureService,
    TicketUpdateUserTicketProcedureService,
    TicketProcessResultTicketProcedureService,
    TicketDestroyTicketProcedureService,
    TicketDestroyTicketRegimenService,
    TicketUpdateMoneyTicketRegimenService,
    TicketUpdateUserTicketRegimenOperation,
  ],
  exports: [TicketAddTicketProcedureListService],
})
export class TicketChangeProcedureModule { }
