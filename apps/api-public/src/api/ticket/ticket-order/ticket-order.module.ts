import { Module } from '@nestjs/common'
import { TicketActionModule } from '../ticket-action/ticket-action.module'
import { TicketOrderBasicUpsertService } from './service/ticket-order-basic-upsert.service'
import { TicketOrderController } from './ticket-order.controller'
import { TicketOrderService } from './ticket-order.service'

@Module({
  imports: [TicketActionModule],
  controllers: [TicketOrderController],
  providers: [TicketOrderService, TicketOrderBasicUpsertService],
})
export class TicketOrderModule { }
