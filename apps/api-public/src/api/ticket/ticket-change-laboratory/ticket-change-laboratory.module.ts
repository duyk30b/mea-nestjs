import { Module } from '@nestjs/common'
import { ApiTicketLaboratoryGroupModule } from '../../api-ticket-laboratory-group/api-ticket-laboratory-group.module'
import { TicketChangeUserModule } from '../ticket-change-user/ticket-change-user.module'
import { TicketChangeLaboratoryController } from './ticket-change-laboratory.controller'
import { TicketChangeLaboratoryService } from './ticket-change-laboratory.service'

@Module({
  imports: [TicketChangeUserModule, ApiTicketLaboratoryGroupModule],
  controllers: [TicketChangeLaboratoryController],
  providers: [TicketChangeLaboratoryService],
})
export class TicketChangeLaboratoryModule { }
