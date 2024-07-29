import { Module } from '@nestjs/common'
import { ApiAppointmentController } from './api-appointment.controller'
import { ApiAppointmentService } from './api-appointment.service'

@Module({
  imports: [],
  controllers: [ApiAppointmentController],
  providers: [ApiAppointmentService],
})
export class ApiAppointmentModule { }
