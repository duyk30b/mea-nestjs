import { Module } from '@nestjs/common'
import { ApiBatchMovementModule } from './api-batch-movement/api-batch-movement.module'
import { ApiBatchModule } from './api-batch/api-batch.module'
import { ApiCustomerPaymentModule } from './api-customer-payment/api-customer-payment.module'
import { ApiCustomerModule } from './api-customer/api-customer.module'
import { ApiDistributorPaymentModule } from './api-distributor-payment/api-distributor-payment.module'
import { ApiDistributorModule } from './api-distributor/api-distributor.module'
import { ApiInvoiceItemModule } from './api-invoice-item/api-invoice-item.module'
import { ApiInvoiceModule } from './api-invoice/api-invoice.module'
import { ApiOrganizationModule } from './api-organization/api-organization.module'
import { ApiPermissionModule } from './api-permission/api-permission.module'
import { ApiProcedureModule } from './api-procedure/api-procedure.module'
import { ApiProductMovementModule } from './api-product-movement/api-product-movement.module'
import { ApiProductModule } from './api-product/api-product.module'
import { ApiReceiptItemModule } from './api-receipt-item/api-receipt-item.module'
import { ApiReceiptModule } from './api-receipt/api-receipt.module'
import { ApiRoleModule } from './api-role/api-role.module'
import { ApiStatisticModule } from './api-statistics/api-statistic.module'
import { ApiUserModule } from './api-user/api-user.module'
import { ApiVisitBatchModule } from './api-visit-batch/api-visit-batch.module'
import { ApiVisitDiagnosisModule } from './api-visit-diagnosis/api-visit-diagnosis.module'
import { ApiVisitModule } from './api-visit/api-visit.module'

@Module({
  imports: [
    ApiOrganizationModule,
    ApiRoleModule,
    ApiPermissionModule,
    ApiUserModule,
    ApiCustomerModule,
    ApiCustomerPaymentModule,
    ApiDistributorModule,
    ApiDistributorPaymentModule,
    ApiInvoiceModule,
    ApiInvoiceItemModule,
    ApiProductModule,
    ApiBatchModule,
    ApiProductMovementModule,
    ApiBatchMovementModule,
    ApiProcedureModule,
    ApiReceiptModule,
    ApiReceiptItemModule,
    ApiStatisticModule,
    ApiVisitModule,
    ApiVisitDiagnosisModule,
    ApiVisitBatchModule,
  ],
  controllers: [],
  providers: [],
})
export class ApiModule {}
