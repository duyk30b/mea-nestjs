import { Module } from '@nestjs/common'
import { ApiTicketController } from './api-ticket.controller'
import { ApiTicketService } from './api-ticket.service'

@Module({
  imports: [],
  controllers: [ApiTicketController],
  providers: [ApiTicketService],
})
export class ApiTicketModule {}
