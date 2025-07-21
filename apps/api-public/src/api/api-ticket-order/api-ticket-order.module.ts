import { Module } from '@nestjs/common'
import { PaymentActionService } from '../api-payment/payment-action.service'
import { TicketActionService } from '../ticket/service/ticket-action.service'
import { ApiTicketOrderController } from './api-ticket-order.controller'
import { ApiTicketOrderService } from './api-ticket-order.service'

@Module({
  imports: [],
  controllers: [ApiTicketOrderController],
  providers: [ApiTicketOrderService, TicketActionService, PaymentActionService],
})
export class ApiTicketOrderModule { }
