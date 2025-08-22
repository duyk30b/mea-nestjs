import { Module } from '@nestjs/common'
import { TicketChangeAttributeController } from './ticket-change-attribute.controller'
import { TicketChangeAttributeService } from './ticket-change-attribute.service'

@Module({
  imports: [],
  controllers: [TicketChangeAttributeController],
  providers: [TicketChangeAttributeService],
})
export class TicketChangeAttributeModule { }
