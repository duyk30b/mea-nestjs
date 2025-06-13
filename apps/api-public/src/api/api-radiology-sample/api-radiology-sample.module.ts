import { Module } from '@nestjs/common'
import { ApiRadiologySampleController } from './api-radiology-sample.controller'
import { ApiRadiologySampleService } from './api-radiology-sample.service'

@Module({
  imports: [],
  controllers: [ApiRadiologySampleController],
  providers: [ApiRadiologySampleService],
})
export class ApiRadiologySampleModule { }
