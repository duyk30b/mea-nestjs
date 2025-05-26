import { Module } from '@nestjs/common'
import { ApiTicketClinicUserModule } from '../api-ticket-clinic-user/api-ticket-clinic-user.module'
import { ApiTicketClinicLaboratoryController } from './api-ticket-clinic-laboratory.controller'
import { ApiTicketClinicLaboratoryService } from './api-ticket-clinic-laboratory.service'

@Module({
  imports: [ApiTicketClinicUserModule],
  controllers: [ApiTicketClinicLaboratoryController],
  providers: [ApiTicketClinicLaboratoryService],
})
export class ApiTicketClinicLaboratoryModule { }
