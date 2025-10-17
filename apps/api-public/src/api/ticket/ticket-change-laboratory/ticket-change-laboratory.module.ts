import { Module } from '@nestjs/common'
import { ApiTicketLaboratoryGroupModule } from '../../api-ticket-laboratory-group/api-ticket-laboratory-group.module'
import { TicketAddTicketLaboratoryGroupService } from './service/ticket-add-ticket-laboratory-group.service'
import { TicketUpdateRequestTicketLaboratoryService } from './service/ticket-update-request-ticket-laboratory.service'
import { TicketUpdateTicketLaboratoryGroupService } from './service/ticket-update-ticket-laboratory-group.service'
import { TicketChangeLaboratoryController } from './ticket-change-laboratory.controller'
import { TicketChangeLaboratoryService } from './ticket-change-laboratory.service'

@Module({
  imports: [ApiTicketLaboratoryGroupModule],
  controllers: [TicketChangeLaboratoryController],
  providers: [
    TicketAddTicketLaboratoryGroupService,
    TicketUpdateTicketLaboratoryGroupService,
    TicketChangeLaboratoryService,
    TicketUpdateRequestTicketLaboratoryService,
  ],
})
export class TicketChangeLaboratoryModule { }
