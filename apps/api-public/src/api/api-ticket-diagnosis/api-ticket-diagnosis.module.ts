import { Module } from '@nestjs/common'
import { ApiTicketDiagnosisController } from './api-ticket-diagnosis.controller'
import { ApiTicketDiagnosisService } from './api-ticket-diagnosis.service'

@Module({
  imports: [],
  controllers: [ApiTicketDiagnosisController],
  providers: [ApiTicketDiagnosisService],
})
export class ApiTicketDiagnosisModule {}
