import { Module } from '@nestjs/common'
import { ApiFileCustomerModule } from './api-file-customer/api-file-customer.module'
import { ApiFileProductModule } from './api-file-product/api-file-product.module'
import { ApiFileReceiptModule } from './api-file-receipt/api-file-receipt.module'
import { ApiFileTicketModule } from './api-file-ticket/api-file-ticket.module'

@Module({
  imports: [ApiFileProductModule, ApiFileReceiptModule, ApiFileCustomerModule, ApiFileTicketModule],
  controllers: [],
  providers: [],
})
export class ApiFileModule { }
