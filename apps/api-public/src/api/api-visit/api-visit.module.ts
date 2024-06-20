import { Module } from '@nestjs/common'
import { ApiVisitController } from './api-visit.controller'
import { ApiVisitService } from './api-visit.service'

@Module({
  imports: [],
  controllers: [ApiVisitController],
  providers: [ApiVisitService],
})
export class ApiVisitModule {}
