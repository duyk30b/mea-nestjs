import { Module } from '@nestjs/common'
import { ApiInvoiceItemController } from './api-invoice-item.controller'
import { ApiInvoiceItemService } from './api-invoice-item.service'

@Module({
  imports: [],
  controllers: [ApiInvoiceItemController],
  providers: [ApiInvoiceItemService],
})
export class ApiInvoiceItemModule {}
