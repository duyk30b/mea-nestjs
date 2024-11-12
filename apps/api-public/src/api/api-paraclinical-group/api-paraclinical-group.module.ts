import { Module } from '@nestjs/common'
import { ApiParaclinicalGroupController } from './api-paraclinical-group.controller'
import { ApiParaclinicalGroupService } from './api-paraclinical-group.service'

@Module({
  imports: [],
  controllers: [ApiParaclinicalGroupController],
  providers: [ApiParaclinicalGroupService],
})
export class ApiParaclinicalGroupModule { }
