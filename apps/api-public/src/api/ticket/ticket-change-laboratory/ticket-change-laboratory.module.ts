import { Module } from '@nestjs/common'
import { ApiTicketLaboratoryGroupModule } from '../../api-ticket-laboratory-group/api-ticket-laboratory-group.module'
import { TicketChangeLaboratoryController } from './ticket-change-laboratory.controller'
import { TicketChangeLaboratoryService } from './ticket-change-laboratory.service'

@Module({
  imports: [ApiTicketLaboratoryGroupModule],
  controllers: [TicketChangeLaboratoryController],
  providers: [TicketChangeLaboratoryService],
})
export class TicketChangeLaboratoryModule { }
