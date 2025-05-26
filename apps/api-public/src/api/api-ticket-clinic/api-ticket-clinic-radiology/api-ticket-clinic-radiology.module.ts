import { Module } from '@nestjs/common'
import { ApiTicketClinicUserModule } from '../api-ticket-clinic-user/api-ticket-clinic-user.module'
import { ApiTicketClinicRadiologyController } from './api-ticket-clinic-radiology.controller'
import { ApiTicketClinicRadiologyService } from './api-ticket-clinic-radiology.service'

@Module({
  imports: [ApiTicketClinicUserModule],
  controllers: [ApiTicketClinicRadiologyController],
  providers: [ApiTicketClinicRadiologyService],
})
export class ApiTicketClinicRadiologyModule { }
