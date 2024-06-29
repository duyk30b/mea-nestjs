import { Module } from '@nestjs/common'
import { ApiVisitActionService } from './api-visit-action.service'
import { ApiVisitClinicService } from './api-visit-clinic.service'
import { ApiVisitController } from './api-visit.controller'
import { ApiVisitService } from './api-visit.service'

@Module({
  imports: [],
  controllers: [ApiVisitController],
  providers: [ApiVisitService, ApiVisitActionService, ApiVisitClinicService],
})
export class ApiVisitModule {}
