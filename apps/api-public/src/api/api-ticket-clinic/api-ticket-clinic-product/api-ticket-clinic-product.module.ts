import { Module } from '@nestjs/common'
import { ApiTicketClinicUserModule } from '../api-ticket-clinic-user/api-ticket-clinic-user.module'
import { ApiTicketClinicProductController } from './api-ticket-clinic-product.controller'
import { ApiTicketClinicProductService } from './api-ticket-clinic-product.service'

@Module({
  imports: [ApiTicketClinicUserModule],
  controllers: [ApiTicketClinicProductController],
  providers: [ApiTicketClinicProductService],
})
export class ApiTicketClinicProductModule { }
