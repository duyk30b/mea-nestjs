import { Module } from '@nestjs/common'
import { ApiTicketBatchController } from './api-ticket-batch.controller'
import { ApiTicketBatchService } from './api-ticket-batch.service'

@Module({
  imports: [],
  controllers: [ApiTicketBatchController],
  providers: [ApiTicketBatchService],
})
export class ApiTicketBatchModule { }
