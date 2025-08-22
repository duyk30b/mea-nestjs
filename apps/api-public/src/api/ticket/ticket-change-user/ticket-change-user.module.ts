import { Module } from '@nestjs/common'
import { TicketChangeUserController } from './ticket-change-user.controller'
import { TicketChangeUserService } from './ticket-change-user.service'

@Module({
  imports: [],
  controllers: [TicketChangeUserController],
  providers: [TicketChangeUserService],
  exports: [TicketChangeUserService],
})
export class TicketChangeUserModule { }
