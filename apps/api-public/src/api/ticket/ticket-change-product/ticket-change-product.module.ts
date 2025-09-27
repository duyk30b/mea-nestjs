import { Module } from '@nestjs/common'
import { TicketChangeUserModule } from '../ticket-change-user/ticket-change-user.module'
import { TicketAddTicketProductService } from './service/ticket-add-ticket-product-list.service'
import { TicketChangeProductController } from './ticket-change-product.controller'
import { TicketChangeProductService } from './ticket-change-product.service'

@Module({
  imports: [TicketChangeUserModule],
  controllers: [TicketChangeProductController],
  providers: [TicketChangeProductService, TicketAddTicketProductService],
})
export class TicketChangeProductModule { }
