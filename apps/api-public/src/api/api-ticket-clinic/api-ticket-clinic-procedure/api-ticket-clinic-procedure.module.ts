import { Module } from '@nestjs/common'
import { ApiTicketClinicUserModule } from '../api-ticket-clinic-user/api-ticket-clinic-user.module'
import { ApiTicketClinicProcedureController } from './api-ticket-clinic-procedure.controller'
import { ApiTicketClinicProcedureService } from './api-ticket-clinic-procedure.service'

@Module({
  imports: [ApiTicketClinicUserModule],
  controllers: [ApiTicketClinicProcedureController],
  providers: [ApiTicketClinicProcedureService],
})
export class ApiTicketClinicProcedureModule { }
