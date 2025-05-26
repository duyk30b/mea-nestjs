import { Module } from '@nestjs/common'
import { ApiTicketClinicUserController } from './api-ticket-clinic-user.controller'
import { ApiTicketClinicUserService } from './api-ticket-clinic-user.service'

@Module({
  imports: [],
  controllers: [ApiTicketClinicUserController],
  providers: [ApiTicketClinicUserService],
  exports: [ApiTicketClinicUserService],
})
export class ApiTicketClinicUserModule { }
