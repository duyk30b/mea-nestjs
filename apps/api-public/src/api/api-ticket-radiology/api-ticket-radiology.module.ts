import { Module } from '@nestjs/common'
import { ApiTicketRadiologyController } from './api-ticket-radiology.controller'
import { ApiTicketRadiologyService } from './api-ticket-radiology.service'

@Module({
  imports: [],
  controllers: [ApiTicketRadiologyController],
  providers: [ApiTicketRadiologyService],
  exports: [ApiTicketRadiologyService],
})
export class ApiTicketRadiologyModule { }
