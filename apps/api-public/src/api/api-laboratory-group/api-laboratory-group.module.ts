import { Module } from '@nestjs/common'
import { ApiRadiologyGroupService } from '../api-radiology-group/api-radiology-group.service'
import { ApiLaboratoryGroupController } from './api-laboratory-group.controller'
import { ApiLaboratoryGroupService } from './api-laboratory-group.service'

@Module({
  imports: [],
  controllers: [ApiLaboratoryGroupController],
  providers: [ApiLaboratoryGroupService, ApiRadiologyGroupService],
})
export class ApiLaboratoryGroupModule { }
