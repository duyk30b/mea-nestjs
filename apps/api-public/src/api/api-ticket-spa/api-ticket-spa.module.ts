import { Module } from '@nestjs/common'
import { ApiTicketSpaController } from './api-ticket-spa.controller'
import { ApiTicketSpaService } from './api-ticket-spa.service'

@Module({
  imports: [],
  controllers: [ApiTicketSpaController],
  providers: [ApiTicketSpaService],
})
export class ApiTicketSpaModule { }
