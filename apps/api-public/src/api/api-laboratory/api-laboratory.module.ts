import { Module } from '@nestjs/common'
import { ApiLaboratoryController } from './api-laboratory.controller'
import { ApiLaboratoryService } from './api-laboratory.service'

@Module({
  imports: [],
  controllers: [ApiLaboratoryController],
  providers: [ApiLaboratoryService],
})
export class ApiLaboratoryModule {}
