import { Module } from '@nestjs/common'
import { ApiTicketProcedureController } from './api-ticket-procedure.controller'
import { ApiTicketProcedureService } from './api-ticket-procedure.service'

@Module({
  imports: [],
  controllers: [ApiTicketProcedureController],
  providers: [ApiTicketProcedureService],
})
export class ApiTicketProcedureModule {}
