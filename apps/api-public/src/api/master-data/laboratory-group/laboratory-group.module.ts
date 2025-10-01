import { Module } from '@nestjs/common'
import { LaboratoryGroupController } from './laboratory-group.controller'
import { LaboratoryGroupService } from './laboratory-group.service'

@Module({
  imports: [],
  controllers: [LaboratoryGroupController],
  providers: [LaboratoryGroupService],
})
export class LaboratoryGroupModule { }
