import { Module } from '@nestjs/common'
import { ApiFileProductDownloadExcel } from '../api-file-product/api-file-product.download-excel'
import { ApiFileReceiptController } from './api-file-receipt.controller'
import { ApiFileReceiptUploadExcel } from './api-file-receipt.upload-excel'

@Module({
  imports: [],
  controllers: [ApiFileReceiptController],
  providers: [ApiFileReceiptUploadExcel, ApiFileProductDownloadExcel],
})
export class ApiFileReceiptModule { }
