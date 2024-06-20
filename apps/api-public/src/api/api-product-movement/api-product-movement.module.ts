import { Module } from '@nestjs/common'
import { ApiProductMovementController } from './api-product-movement.controller'
import { ApiProductMovementService } from './api-product-movement.service'

@Module({
  imports: [],
  controllers: [ApiProductMovementController],
  providers: [ApiProductMovementService],
})
export class ApiProductMovementModule {}
