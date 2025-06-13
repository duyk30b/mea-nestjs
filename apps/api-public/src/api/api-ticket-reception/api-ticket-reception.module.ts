import { Module } from '@nestjs/common'
import { ApiTicketClinicUserModule } from '../api-ticket-clinic/api-ticket-clinic-user/api-ticket-clinic-user.module'
import { ApiTicketReceptionController } from './api-ticket-reception.controller'
import { ApiTicketReceptionService } from './api-ticket-reception.service'

@Module({
  imports: [
    ApiTicketClinicUserModule,
  ],
  controllers: [ApiTicketReceptionController],
  providers: [ApiTicketReceptionService],
})
export class ApiTicketReceptionModule { }
