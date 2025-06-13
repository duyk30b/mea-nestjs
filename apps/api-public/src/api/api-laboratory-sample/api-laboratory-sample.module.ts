import { Module } from '@nestjs/common'
import { ApiLaboratorySampleController } from './api-laboratory-sample.controller'
import { ApiLaboratorySampleService } from './api-laboratory-sample.service'

@Module({
  imports: [],
  controllers: [ApiLaboratorySampleController],
  providers: [ApiLaboratorySampleService],
})
export class ApiLaboratorySampleModule { }
