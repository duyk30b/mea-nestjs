import { Module } from '@nestjs/common'
import { PaymentTicketController } from './payment_ticket.controller'
import { PaymentTicketService } from './payment_ticket.service'

@Module({
  imports: [],
  controllers: [PaymentTicketController],
  providers: [PaymentTicketService],
})
export class PaymentTicketModule {}
