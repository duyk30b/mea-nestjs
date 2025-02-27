import { Module } from '@nestjs/common'
import { ApiTicketClinicAttributeController } from './api-ticket-clinic-attribute.controller'
import { ApiTicketClinicAttributeService } from './api-ticket-clinic-attribute.service'

@Module({
  imports: [],
  controllers: [ApiTicketClinicAttributeController],
  providers: [ApiTicketClinicAttributeService],
})
export class ApiTicketClinicAttributeModule { }
