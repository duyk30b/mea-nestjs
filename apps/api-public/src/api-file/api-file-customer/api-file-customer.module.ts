import { Module } from '@nestjs/common'
import { ApiFileCustomerController } from './api-file-customer.controller'
import { ApiFileCustomerDownloadExcel } from './api-file-customer.download-excel'
import { ApiFileCustomerUploadExcel } from './api-file-customer.upload-excel'

@Module({
  imports: [],
  controllers: [ApiFileCustomerController],
  providers: [ApiFileCustomerDownloadExcel, ApiFileCustomerUploadExcel],
})
export class ApiFileCustomerModule { }
