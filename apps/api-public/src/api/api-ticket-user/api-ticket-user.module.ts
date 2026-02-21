import { Module } from '@nestjs/common'
import { ApiTicketUserController } from './api-ticket-user.controller'
import { ApiTicketUserService } from './api-ticket-user.service'

@Module({
  imports: [],
  controllers: [ApiTicketUserController],
  providers: [ApiTicketUserService],
})
export class ApiTicketUserModule { }
