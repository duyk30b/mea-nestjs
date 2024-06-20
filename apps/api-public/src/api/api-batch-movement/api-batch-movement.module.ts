import { Module } from '@nestjs/common'
import { ApiBatchMovementController } from './api-batch-movement.controller'
import { ApiBatchMovementService } from './api-batch-movement.service'

@Module({
  imports: [],
  controllers: [ApiBatchMovementController],
  providers: [ApiBatchMovementService],
})
export class ApiBatchMovementModule {}
