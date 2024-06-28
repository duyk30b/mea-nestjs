import { Module } from '@nestjs/common'
import { ApiVisitRadiologyController } from './api-visit-radiology.controller'
import { ApiVisitRadiologyService } from './api-visit-radiology.service'

@Module({
  imports: [],
  controllers: [ApiVisitRadiologyController],
  providers: [ApiVisitRadiologyService],
})
export class ApiVisitRadiologyModule {}
