import { Module } from '@nestjs/common'
import { ApiBaseVisitModule } from './api-base-visit/api-base-visit.module'
import { ApiClinicVisitModule } from './api-clinic-visit/api-base-visit.module'
import { ApiInvoiceVisitModule } from './api-invoice-visit/api-invoice-visit.module'

@Module({
  imports: [ApiBaseVisitModule, ApiInvoiceVisitModule, ApiClinicVisitModule],
  controllers: [],
  providers: [],
})
export class ApiVisitModule {}
