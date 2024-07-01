import { Module } from '@nestjs/common'
import { ApiBaseVisitModule } from './api-base-visit/api-base-visit.module'
import { ApiClinicVisitModule } from './api-clinic-visit/api-base-visit.module'
import { ApiInvoiceVisitModule } from './api-invoice-visit/api-invoice-visit.module'
import { ApiVisitActionService } from './api-visit-action.service'
import { ApiVisitController } from './api-visit.controller'

@Module({
  imports: [ApiBaseVisitModule, ApiInvoiceVisitModule, ApiClinicVisitModule],
  controllers: [ApiVisitController],
  providers: [ApiVisitActionService],
})
export class ApiVisitModule {}
