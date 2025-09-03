import { Module } from '@nestjs/common'
import { ApiTicketProcedureService } from '../api-ticket-procedure/api-ticket-procedure.service'
import { ApiAppointmentController } from './api-appointment.controller'
import { ApiAppointmentService } from './api-appointment.service'

@Module({
  imports: [],
  controllers: [ApiAppointmentController],
  providers: [ApiAppointmentService, ApiTicketProcedureService],
})
export class ApiAppointmentModule { }
