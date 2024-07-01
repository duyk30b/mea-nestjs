import { Module } from '@nestjs/common'
import { ApiBaseVisitController } from './api-base-visit.controller'
import { ApiBaseVisitService } from './api-base-visit.service'

@Module({
  imports: [],
  controllers: [ApiBaseVisitController],
  providers: [ApiBaseVisitService],
})
export class ApiBaseVisitModule {}
