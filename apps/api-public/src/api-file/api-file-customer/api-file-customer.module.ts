import { Module } from '@nestjs/common'
import { ApiFileCustomerController } from './api-file-customer.controller'
import { ApiFileCustomerDownloadExcel } from './api-file-customer.download-excel'

@Module({
  imports: [],
  controllers: [ApiFileCustomerController],
  providers: [ApiFileCustomerDownloadExcel],
})
export class ApiFileCustomerModule { }
