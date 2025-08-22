import { Module } from '@nestjs/common'
import { TicketActionService } from '../ticket-action/ticket-action.service'
import { TicketMoneyModule } from '../ticket-money/ticket-money.module'
import { TicketOrderController } from './ticket-order.controller'
import { TicketOrderService } from './ticket-order.service'

@Module({
  imports: [TicketMoneyModule],
  controllers: [TicketOrderController],
  providers: [TicketOrderService, TicketActionService],
})
export class TicketOrderModule { }
