import { Module } from '@nestjs/common'
import { ApiVisitBatchController } from './api-visit-batch.controller'
import { ApiVisitBatchService } from './api-visit-batch.service'

@Module({
  imports: [],
  controllers: [ApiVisitBatchController],
  providers: [ApiVisitBatchService],
})
export class ApiVisitBatchModule {}
