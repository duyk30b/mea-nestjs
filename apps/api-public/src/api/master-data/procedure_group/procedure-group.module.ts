import { Module } from '@nestjs/common'
import { ProcedureGroupController } from './procedure-group.controller'
import { ProcedureGroupService } from './procedure-group.service'

@Module({
  imports: [],
  controllers: [ProcedureGroupController],
  providers: [ProcedureGroupService],
})
export class ProcedureGroupModule { }
