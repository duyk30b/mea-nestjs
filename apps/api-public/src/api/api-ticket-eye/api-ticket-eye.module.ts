import { Module } from '@nestjs/common'
import { ApiTicketEyeController } from './api-ticket-eye.controller'
import { ApiTicketEyeService } from './api-ticket-eye.service'

@Module({
  imports: [],
  controllers: [ApiTicketEyeController],
  providers: [ApiTicketEyeService],
})
export class ApiTicketEyeModule { }
