import { Module } from '@nestjs/common'
import { ApiTicketLaboratoryController } from './api-ticket-laboratory.controller'
import { ApiTicketLaboratoryService } from './api-ticket-laboratory.service'

@Module({
  imports: [],
  controllers: [ApiTicketLaboratoryController],
  providers: [ApiTicketLaboratoryService],
})
export class ApiTicketLaboratoryModule { }
