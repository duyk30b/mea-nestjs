import { Module } from '@nestjs/common'
import { ApiMovementController } from './api-movement.controller'
import { ApiMovementService } from './api-movement.service'

@Module({
  imports: [],
  controllers: [ApiMovementController],
  providers: [ApiMovementService],
})
export class ApiMovementModule {}
