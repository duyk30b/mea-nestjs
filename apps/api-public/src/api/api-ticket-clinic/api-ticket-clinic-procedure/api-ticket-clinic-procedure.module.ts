import { Module } from '@nestjs/common'
import { ApiTicketClinicProcedureController } from './api-ticket-clinic-procedure.controller'
import { ApiTicketClinicProcedureService } from './api-ticket-clinic-procedure.service'

@Module({
  imports: [],
  controllers: [ApiTicketClinicProcedureController],
  providers: [ApiTicketClinicProcedureService],
})
export class ApiTicketClinicProcedureModule { }
