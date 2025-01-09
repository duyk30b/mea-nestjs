import { Module } from '@nestjs/common'
import { ApiTicketClinicRadiologyController } from './api-ticket-clinic-radiology.controller'
import { ApiTicketClinicRadiologyService } from './api-ticket-clinic-radiology.service'

@Module({
  imports: [],
  controllers: [ApiTicketClinicRadiologyController],
  providers: [ApiTicketClinicRadiologyService],
})
export class ApiTicketClinicRadiologyModule { }
