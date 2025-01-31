import { Module } from '@nestjs/common'
import { ApiTicketClinicProductController } from './api-ticket-clinic-product.controller'
import { ApiTicketClinicProductService } from './api-ticket-clinic-product.service'

@Module({
  imports: [],
  controllers: [ApiTicketClinicProductController],
  providers: [ApiTicketClinicProductService],
})
export class ApiTicketClinicProductModule { }
