import { Module } from '@nestjs/common'
import { ApiInvoiceVisitController } from './api-invoice-visit.controller'
import { ApiInvoiceVisitService } from './api-invoice-visit.service'

@Module({
  imports: [],
  controllers: [ApiInvoiceVisitController],
  providers: [ApiInvoiceVisitService],
})
export class ApiInvoiceVisitModule {}
