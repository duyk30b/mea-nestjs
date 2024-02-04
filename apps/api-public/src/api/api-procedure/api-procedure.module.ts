import { Module } from '@nestjs/common'
import { ApiProcedureController } from './api-procedure.controller'
import { ApiProcedureService } from './api-procedure.service'

@Module({
  imports: [],
  controllers: [ApiProcedureController],
  providers: [ApiProcedureService],
})
export class ApiProcedureModule {}
