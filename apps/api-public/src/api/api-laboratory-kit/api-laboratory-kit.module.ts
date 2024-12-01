import { Module } from '@nestjs/common'
import { ApiLaboratoryKitController } from './api-laboratory-kit.controller'
import { ApiLaboratoryKitService } from './api-laboratory-kit.service'

@Module({
  imports: [],
  controllers: [ApiLaboratoryKitController],
  providers: [ApiLaboratoryKitService],
})
export class ApiLaboratoryKitModule { }
