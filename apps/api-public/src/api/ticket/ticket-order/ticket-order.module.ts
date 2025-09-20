import { Module } from '@nestjs/common'
import { TicketActionModule } from '../ticket-action/ticket-action.module'
import { TicketMoneyModule } from '../ticket-money/ticket-money.module'
import { TicketOrderController } from './ticket-order.controller'
import { TicketOrderService } from './ticket-order.service'

@Module({
  imports: [TicketMoneyModule, TicketActionModule],
  controllers: [TicketOrderController],
  providers: [TicketOrderService],
})
export class TicketOrderModule { }
