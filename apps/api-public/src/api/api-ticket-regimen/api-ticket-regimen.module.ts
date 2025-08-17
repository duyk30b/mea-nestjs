import { Module } from '@nestjs/common'
import { ApiTicketRegimenController } from './api-ticket-regimen.controller'
import { ApiTicketRegimenService } from './api-ticket-regimen.service'

@Module({
  controllers: [ApiTicketRegimenController],
  providers: [ApiTicketRegimenService],
})
export class ApiTicketRegimenModule { }
