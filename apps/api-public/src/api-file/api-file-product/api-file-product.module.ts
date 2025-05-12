import { Module } from '@nestjs/common'
import { ApiFileProductController } from './api-file-product.controller'
import { ApiFileProductDownloadExcel } from './api-file-product.download-excel'
import { ApiFileProductUploadExcel } from './api-file-product.upload-excel'

@Module({
  imports: [],
  controllers: [ApiFileProductController],
  providers: [ApiFileProductDownloadExcel, ApiFileProductUploadExcel],
})
export class ApiFileProductModule { }
