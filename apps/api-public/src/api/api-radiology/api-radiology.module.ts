import { Module } from '@nestjs/common'
import { ApiRadiologyGroupService } from '../api-radiology-group/api-radiology-group.service'
import { ApiRadiologyController } from './api-radiology.controller'
import { ApiRadiologyService } from './api-radiology.service'

@Module({
  imports: [],
  controllers: [ApiRadiologyController],
  providers: [ApiRadiologyService, ApiRadiologyGroupService],
})
export class ApiRadiologyModule { }
