import { Module } from '@nestjs/common'
import { ApiTicketOrderController } from './api-ticket-order.controller'
import { ApiTicketOrderService } from './api-ticket-order.service'

@Module({
  imports: [],
  controllers: [ApiTicketOrderController],
  providers: [ApiTicketOrderService],
})
export class ApiTicketOrderModule { }
