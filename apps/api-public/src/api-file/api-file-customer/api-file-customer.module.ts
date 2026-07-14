import { CustomerService } from '@api-public/api/customer/customer.service'
import { CustomerGroupService } from '@api-public/api/master-data/customer_group/customer_group.service'
import { CustomerSourceService } from '@api-public/api/master-data/customer_source/customer_source.service'
import { Module } from '@nestjs/common'
import { ApiFileCustomerController } from './api-file-customer.controller'
import { ApiFileCustomerDownloadExcel } from './api-file-customer.download-excel'
import { ApiFileCustomerUploadExcel } from './api-file-customer.upload-excel'

@Module({
  imports: [],
  controllers: [ApiFileCustomerController],
  providers: [
    ApiFileCustomerDownloadExcel,
    ApiFileCustomerUploadExcel,
    CustomerService,
    CustomerGroupService,
    CustomerSourceService,
  ],
})
export class ApiFileCustomerModule { }
