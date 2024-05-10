import { Module } from '@nestjs/common'
import { ApiBatchModule } from './api-batch/api-batch.module'
import { ApiCustomerPaymentModule } from './api-customer-payment/api-customer-payment.module'
import { ApiCustomerModule } from './api-customer/api-customer.module'
import { ApiDistributorPaymentModule } from './api-distributor-payment/api-distributor-payment.module'
import { ApiDistributorModule } from './api-distributor/api-distributor.module'
import { ApiInvoiceItemModule } from './api-invoice-item/api-invoice-item.module'
import { ApiInvoiceModule } from './api-invoice/api-invoice.module'
import { ApiMovementModule } from './api-movement/api-movement.module'
import { ApiOrganizationModule } from './api-organization/api-organization.module'
import { ApiPermissionModule } from './api-permission/api-permission.module'
import { ApiProcedureModule } from './api-procedure/api-procedure.module'
import { ApiProductModule } from './api-product/api-product.module'
import { ApiReceiptItemModule } from './api-receipt-item/api-receipt-item.module'
import { ApiReceiptModule } from './api-receipt/api-receipt.module'
import { ApiRoleModule } from './api-role/api-role.module'
import { ApiStatisticModule } from './api-statistics/api-statistic.module'
import { ApiUserModule } from './api-user/api-user.module'

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
    ApiMovementModule,
    ApiProcedureModule,
    ApiReceiptModule,
    ApiReceiptItemModule,
    ApiStatisticModule,
  ],
  controllers: [],
  providers: [],
})
export class ApiModule {}
