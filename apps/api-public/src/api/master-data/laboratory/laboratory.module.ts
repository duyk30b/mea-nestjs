import { Module } from '@nestjs/common'
import { LaboratoryGroupService } from '../laboratory-group/laboratory-group.service'
import { LaboratoryController } from './laboratory.controller'
import { LaboratoryService } from './laboratory.service'

@Module({
  imports: [],
  controllers: [LaboratoryController],
  providers: [LaboratoryService, LaboratoryGroupService],
})
export class LaboratoryModule { }
