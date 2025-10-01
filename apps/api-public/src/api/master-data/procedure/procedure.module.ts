import { Module } from '@nestjs/common'
import { ProcedureController } from './procedure.controller'
import { ProcedureService } from './procedure.service'

@Module({
  imports: [],
  controllers: [ProcedureController],
  providers: [ProcedureService],
})
export class ProcedureModule { }
