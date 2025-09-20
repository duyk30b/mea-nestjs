import { Module } from '@nestjs/common'
import { ApiTicketRegimenController } from './api-ticket-regimen.controller'
import { ApiTicketRegimenService } from './api-ticket-regimen.service'

@Module({
  imports: [],
  controllers: [ApiTicketRegimenController],
  providers: [ApiTicketRegimenService],
  exports: [ApiTicketRegimenService],
})
export class ApiTicketRegimenModule { }
