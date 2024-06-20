import { Module } from '@nestjs/common'
import { ApiVisitDiagnosisController } from './api-visit-diagnosis.controller'
import { ApiVisitDiagnosisService } from './api-visit-diagnosis.service'

@Module({
  imports: [],
  controllers: [ApiVisitDiagnosisController],
  providers: [ApiVisitDiagnosisService],
})
export class ApiVisitDiagnosisModule {}
