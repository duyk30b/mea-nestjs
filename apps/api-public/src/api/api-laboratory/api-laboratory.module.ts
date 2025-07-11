import { Module } from '@nestjs/common'
import { ApiLaboratoryGroupService } from '../api-laboratory-group/api-laboratory-group.service'
import { ApiLaboratoryController } from './api-laboratory.controller'
import { ApiLaboratoryService } from './api-laboratory.service'

@Module({
  imports: [],
  controllers: [ApiLaboratoryController],
  providers: [ApiLaboratoryService, ApiLaboratoryGroupService],
})
export class ApiLaboratoryModule { }
