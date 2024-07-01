import { Module } from '@nestjs/common'
import { ApiInvoiceVisitModule } from './api-invoice-visit/api-invoice-visit.module'
import { ApiVisitActionService } from './api-visit-action.service'
import { ApiVisitClinicService } from './api-visit-clinic.service'
import { ApiVisitController } from './api-visit.controller'
import { ApiVisitService } from './api-visit.service'

@Module({
  imports: [ApiInvoiceVisitModule],
  controllers: [ApiVisitController],
  providers: [ApiVisitService, ApiVisitActionService, ApiVisitClinicService],
})
export class ApiVisitModule {}
