import { Module } from '@nestjs/common'
import { ApiBatchController } from './api-batch.controller'
import { ApiBatchService } from './api-batch.service'

@Module({
  imports: [],
  controllers: [ApiBatchController],
  providers: [ApiBatchService],
})
export class ApiBatchModule {}
