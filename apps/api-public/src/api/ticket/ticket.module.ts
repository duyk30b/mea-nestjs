import { Module } from '@nestjs/common'
import { ApiTicketActionController } from './controller/api-ticket-action.controller'
import { ApiTicketQueryController } from './controller/api-ticket-query.controller'
import { ApiTicketReceptionController } from './controller/api-ticket-reception.controller'
import { TicketActionService } from './service/ticket-action.service'
import { TicketQueryService } from './service/ticket-query.service'
import { TicketReceptionService } from './service/ticket-reception.service'
import { TicketUserService } from './service/ticket-user.service'

@Module({
  imports: [],
  controllers: [
    ApiTicketQueryController,
    ApiTicketReceptionController,
    ApiTicketActionController,
  ],
  providers: [TicketQueryService, TicketReceptionService, TicketActionService, TicketUserService],
})
export class TicketModule { }
