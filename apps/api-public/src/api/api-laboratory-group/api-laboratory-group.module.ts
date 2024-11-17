import { Module } from '@nestjs/common'
import { ApiLaboratoryGroupController } from './api-laboratory-group.controller'
import { ApiLaboratoryGroupService } from './api-laboratory-group.service'

@Module({
  imports: [],
  controllers: [ApiLaboratoryGroupController],
  providers: [ApiLaboratoryGroupService],
})
export class ApiLaboratoryGroupModule { }
