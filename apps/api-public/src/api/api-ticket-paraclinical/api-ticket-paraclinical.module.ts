import { Module } from '@nestjs/common'
import { ApiTicketParaclinicalController } from './api-ticket-paraclinical.controller'
import { ApiTicketParaclinicalService } from './api-ticket-paraclinical.service'

@Module({
  imports: [],
  controllers: [ApiTicketParaclinicalController],
  providers: [ApiTicketParaclinicalService],
})
export class ApiTicketParaclinicalModule {}
