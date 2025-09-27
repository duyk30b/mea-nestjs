import { Module } from '@nestjs/common'
import { ApiTicketRadiologyModule } from '../../api-ticket-radiology/api-ticket-radiology.module'
import { TicketAddTicketRadiologyListService } from './service/ticket-add-ticket-radiology-list.operation'
import { TicketChangeRadiologyController } from './ticket-change-radiology.controller'
import { TicketChangeRadiologyService } from './ticket-change-radiology.service'

@Module({
  imports: [ApiTicketRadiologyModule],
  controllers: [TicketChangeRadiologyController],
  providers: [TicketChangeRadiologyService, TicketAddTicketRadiologyListService],
})
export class TicketChangeRadiologyModule { }
