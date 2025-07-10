import { Module } from '@nestjs/common'
import { ApiFileICDController } from './api-file-icd.controller'
import { ApiFileICDUploadExcel } from './api-file-icd.upload-excel'

@Module({
  imports: [],
  controllers: [ApiFileICDController],
  providers: [ApiFileICDUploadExcel],
})
export class ApiFileICDModule { }
