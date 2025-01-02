import { Module } from '@nestjs/common'
import { ApiTicketClinicProcedureModule } from './api-ticket-clinic-procedure/api-ticket-clinic-procedure.module'
import { ApiTicketClinicController } from './api-ticket-clinic.controller'
import { ApiTicketClinicService } from './api-ticket-clinic.service'

@Module({
  imports: [ApiTicketClinicProcedureModule],
  controllers: [ApiTicketClinicController],
  providers: [ApiTicketClinicService],
})
export class ApiTicketClinicModule { }
