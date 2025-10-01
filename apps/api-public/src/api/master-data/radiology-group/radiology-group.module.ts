import { Module } from '@nestjs/common'
import { RadiologyGroupController } from './radiology-group.controller'
import { RadiologyGroupService } from './radiology-group.service'

@Module({
  imports: [],
  controllers: [RadiologyGroupController],
  providers: [RadiologyGroupService],
})
export class RadiologyGroupModule { }
