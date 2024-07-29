import { Module } from '@nestjs/common'
import { ApiTicketClinicController } from './api-ticket-clinic.controller'
import { ApiTicketClinicService } from './api-ticket-clinic.service'

@Module({
  imports: [],
  controllers: [ApiTicketClinicController],
  providers: [ApiTicketClinicService],
})
export class ApiTicketClinicModule { }
