import { Module } from '@nestjs/common'
import { ApiTicketLaboratoryGroupModule } from '../../api-ticket-laboratory-group/api-ticket-laboratory-group.module'
import { TicketUpdateRequestTicketLaboratoryService } from './service/ticket-update-request-ticket-laboratory.service'
import { TicketUpsertLaboratoryService } from './service/ticket-upsert-ticket-laboratory-group.service'
import { TicketChangeLaboratoryController } from './ticket-change-laboratory.controller'
import { TicketChangeLaboratoryService } from './ticket-change-laboratory.service'

@Module({
  imports: [ApiTicketLaboratoryGroupModule],
  controllers: [TicketChangeLaboratoryController],
  providers: [
    TicketChangeLaboratoryService,
    TicketUpsertLaboratoryService,
    TicketUpdateRequestTicketLaboratoryService,
  ],
})
export class TicketChangeLaboratoryModule { }
