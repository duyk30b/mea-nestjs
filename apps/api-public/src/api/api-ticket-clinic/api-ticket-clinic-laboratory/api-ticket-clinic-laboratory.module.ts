import { Module } from '@nestjs/common'
import { ApiTicketClinicLaboratoryController } from './api-ticket-clinic-laboratory.controller'
import { ApiTicketClinicLaboratoryService } from './api-ticket-clinic-laboratory.service'

@Module({
  imports: [],
  controllers: [ApiTicketClinicLaboratoryController],
  providers: [ApiTicketClinicLaboratoryService],
})
export class ApiTicketClinicLaboratoryModule { }
