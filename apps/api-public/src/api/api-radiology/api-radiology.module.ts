import { Module } from '@nestjs/common'
import { ApiRadiologyController } from './api-radiology.controller'
import { ApiRadiologyService } from './api-radiology.service'

@Module({
  imports: [],
  controllers: [ApiRadiologyController],
  providers: [ApiRadiologyService],
})
export class ApiRadiologyModule {}
