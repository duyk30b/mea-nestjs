import { Module } from '@nestjs/common'
import { ApiReceiptService } from '../../api/api-receipt/api-receipt.service'
import { ApiFileReceiptController } from './api-file-receipt.controller'
import { ApiFileReceiptUploadExcel } from './api-file-receipt.upload-excel'

@Module({
  imports: [],
  controllers: [ApiFileReceiptController],
  providers: [ApiFileReceiptUploadExcel, ApiReceiptService],
})
export class ApiFileReceiptModule { }
