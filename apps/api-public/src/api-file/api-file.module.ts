import { Module } from '@nestjs/common'
import { ApiFileCustomerModule } from './api-file-customer/api-file-customer.module'
import { ApiFileICDModule } from './api-file-icd/api-file-icd.module'
import { ApiFileLaboratoryModule } from './api-file-laboratory/api-file-laboratory.module'
import { ApiFileProcedureModule } from './api-file-procedure/api-file-procedure.module'
import { ApiFileProductModule } from './api-file-product/api-file-product.module'
import { ApiFilePurchaseOrderModule } from './api-file-purchase-order/api-file-purchase-order.module'
import { ApiFileRadiologyModule } from './api-file-radiology/api-file-radiology.module'
import { ApiFileTicketModule } from './api-file-ticket/api-file-ticket.module'

@Module({
  imports: [
    ApiFileICDModule,
    ApiFileProductModule,
    ApiFileProcedureModule,
    ApiFileLaboratoryModule,
    ApiFileRadiologyModule,
    ApiFilePurchaseOrderModule,
    ApiFileCustomerModule,
    ApiFileTicketModule,
  ],
  controllers: [],
  providers: [],
})
export class ApiFileModule { }
