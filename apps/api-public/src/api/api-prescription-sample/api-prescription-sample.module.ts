import { Module } from '@nestjs/common'
import { ApiPrescriptionSampleController } from './api-prescription-sample.controller'
import { ApiPrescriptionSampleService } from './api-prescription-sample.service'

@Module({
  imports: [],
  controllers: [ApiPrescriptionSampleController],
  providers: [ApiPrescriptionSampleService],
})
export class ApiPrescriptionSampleModule { }
