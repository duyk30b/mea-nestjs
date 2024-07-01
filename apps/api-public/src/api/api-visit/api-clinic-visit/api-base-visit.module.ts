import { Module } from '@nestjs/common'
import { ApiClinicVisitController } from './api-clinic-visit.controller'
import { ApiClinicVisitService } from './api-clinic-visit.service'

@Module({
  imports: [],
  controllers: [ApiClinicVisitController],
  providers: [ApiClinicVisitService],
})
export class ApiClinicVisitModule {}
