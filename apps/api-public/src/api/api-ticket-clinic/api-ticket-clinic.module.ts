import { Module } from '@nestjs/common'
import { ApiTicketClinicProcedureModule } from './api-ticket-clinic-procedure/api-ticket-clinic-procedure.module'
import { ApiTicketClinicRadiologyModule } from './api-ticket-clinic-radiology/api-ticket-clinic-radiology.module'
import { ApiTicketClinicUserModule } from './api-ticket-clinic-user/api-ticket-clinic-user.module'
import { ApiTicketClinicController } from './api-ticket-clinic.controller'
import { ApiTicketClinicService } from './api-ticket-clinic.service'

@Module({
  imports: [
    ApiTicketClinicProcedureModule,
    ApiTicketClinicRadiologyModule,
    ApiTicketClinicUserModule,
  ],
  controllers: [ApiTicketClinicController],
  providers: [ApiTicketClinicService],
})
export class ApiTicketClinicModule { }
