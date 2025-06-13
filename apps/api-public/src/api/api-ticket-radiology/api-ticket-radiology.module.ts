import { Module } from '@nestjs/common'
import { ApiTicketClinicUserModule } from '../api-ticket-clinic/api-ticket-clinic-user/api-ticket-clinic-user.module'
import { ApiTicketRadiologyAction } from './api-ticket-radiology.action'
import { ApiTicketRadiologyController } from './api-ticket-radiology.controller'
import { ApiTicketRadiologyService } from './api-ticket-radiology.service'

@Module({
  imports: [ApiTicketClinicUserModule],
  controllers: [ApiTicketRadiologyController],
  providers: [ApiTicketRadiologyService, ApiTicketRadiologyAction],
})
export class ApiTicketRadiologyModule { }
