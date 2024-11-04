import { Module } from '@nestjs/common'
import { ApiRadiologyGroupController } from './api-radiology-group.controller'
import { ApiRadiologyGroupService } from './api-radiology-group.service'

@Module({
  imports: [],
  controllers: [ApiRadiologyGroupController],
  providers: [ApiRadiologyGroupService],
})
export class ApiRadiologyGroupModule { }
