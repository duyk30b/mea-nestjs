import { Module } from '@nestjs/common'
import { ApiTicketRadiologyModule } from '../../api-ticket-radiology/api-ticket-radiology.module'
import { TicketChangeUserModule } from '../ticket-change-user/ticket-change-user.module'
import { TicketChangeRadiologyController } from './ticket-change-radiology.controller'
import { TicketChangeRadiologyService } from './ticket-change-radiology.service'

@Module({
  imports: [TicketChangeUserModule, ApiTicketRadiologyModule],
  controllers: [TicketChangeRadiologyController],
  providers: [TicketChangeRadiologyService],
})
export class TicketChangeRadiologyModule { }
