import { TicketRadiologyResource } from '@api-public/resource/ticket-radiology/ticket-radiology.resource'
import { Module } from '@nestjs/common'
import { TicketAddTicketRadiologyListService } from './service/ticket-add-ticket-radiology-list.operation'
import { TicketChangeRadiologyController } from './ticket-change-radiology.controller'
import { TicketChangeRadiologyService } from './ticket-change-radiology.service'

@Module({
  imports: [],
  controllers: [TicketChangeRadiologyController],
  providers: [
    TicketRadiologyResource,
    TicketChangeRadiologyService,
    TicketAddTicketRadiologyListService,
  ],
})
export class TicketChangeRadiologyModule {}
