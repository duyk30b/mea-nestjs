import { Module } from '@nestjs/common'
import { RadiologyGroupService } from '../radiology-group/radiology-group.service'
import { RadiologyController } from './radiology.controller'
import { RadiologyService } from './radiology.service'

@Module({
  imports: [],
  controllers: [RadiologyController],
  providers: [RadiologyService, RadiologyGroupService],
})
export class RadiologyModule { }
