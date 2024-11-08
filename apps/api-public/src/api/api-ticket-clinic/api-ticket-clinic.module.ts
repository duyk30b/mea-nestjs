import { Module } from '@nestjs/common'
import { ApiTicketClinicController } from './api-ticket-clinic.controller'
import { ApiTicketClinicService } from './api-ticket-clinic.service'
import { ApiTicketEyeController } from './api-ticket-eye.controller'

@Module({
  imports: [],
  controllers: [ApiTicketClinicController, ApiTicketEyeController],
  providers: [ApiTicketClinicService],
})
export class ApiTicketClinicModule { }
