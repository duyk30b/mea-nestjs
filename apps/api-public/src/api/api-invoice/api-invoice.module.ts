import { Module } from '@nestjs/common'
import { ApiInvoiceController } from './api-invoice.controller'
import { ApiInvoiceService } from './api-invoice.service'

@Module({
  imports: [],
  controllers: [ApiInvoiceController],
  providers: [ApiInvoiceService],
})
export class ApiInvoiceModule {}
