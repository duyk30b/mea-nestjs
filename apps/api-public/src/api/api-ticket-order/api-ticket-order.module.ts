import { Module } from '@nestjs/common'
import { PaymentCustomerService } from '../api-payment/payment-customer.service'
import { TicketActionService } from '../ticket/service/ticket-action.service'
import { ApiTicketOrderController } from './api-ticket-order.controller'
import { ApiTicketOrderService } from './api-ticket-order.service'

@Module({
  imports: [],
  controllers: [ApiTicketOrderController],
  providers: [ApiTicketOrderService, TicketActionService, PaymentCustomerService],
})
export class ApiTicketOrderModule { }
