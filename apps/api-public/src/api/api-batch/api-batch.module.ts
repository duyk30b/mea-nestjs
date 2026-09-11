import { BatchResource } from '@api-public/resource/batch-resource/batch.resource'
import { Module } from '@nestjs/common'
import { ApiBatchController } from './api-batch.controller'
import { ApiBatchService } from './api-batch.service'

@Module({
  imports: [],
  controllers: [ApiBatchController],
  providers: [BatchResource, ApiBatchService],
})
export class ApiBatchModule {}
