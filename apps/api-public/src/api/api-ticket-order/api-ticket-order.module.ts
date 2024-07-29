import { Module } from '@nestjs/common'
import { ApiTicketOrderActionService } from './api-ticket-order-action.service'
import { ApiTicketOrderBasicService } from './api-ticket-order-basic.service'
import { ApiTicketOrderController } from './api-ticket-order.controller'

@Module({
  imports: [],
  controllers: [ApiTicketOrderController],
  providers: [
    ApiTicketOrderBasicService, ApiTicketOrderActionService,
  ],
})
export class ApiTicketOrderModule { }
