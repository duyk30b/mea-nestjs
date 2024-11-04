import { Module } from '@nestjs/common'
import { ApiProcedureGroupController } from './api-procedure-group.controller'
import { ApiProcedureGroupService } from './api-procedure-group.service'

@Module({
  imports: [],
  controllers: [ApiProcedureGroupController],
  providers: [ApiProcedureGroupService],
})
export class ApiProcedureGroupModule { }
