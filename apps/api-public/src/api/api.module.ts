import { Module } from '@nestjs/common'
import { ApiAuthModule } from './api-auth/api-auth.module'
import { ApiCustomerPaymentModule } from './api-customer-payment/api-customer-payment.module'
import { ApiCustomerModule } from './api-customer/api-customer.module'
import { ApiDistributorPaymentModule } from './api-distributor-payment/api-distributor-payment.module'
import { ApiDistributorModule } from './api-distributor/api-distributor.module'
import { ApiInvoiceItemModule } from './api-invoice-item/api-invoice-item.module'
import { ApiInvoiceModule } from './api-invoice/api-invoice.module'
import { ApiMeModule } from './api-me/api-me.module'
import { ApiOrganizationModule } from './api-organization/api-organization.module'
import { ApiPermissionModule } from './api-permission/api-permission.module'
import { ApiProcedureModule } from './api-procedure/api-procedure.module'
import { ApiProductBatchModule } from './api-product-batch/api-product-batch.module'
import { ApiProductMovementModule } from './api-product-movement/api-product-movement.module'
import { ApiProductModule } from './api-product/api-product.module'
import { ApiReceiptModule } from './api-receipt/api-receipt.module'
import { ApiRoleModule } from './api-role/api-role.module'
import { ApiRootOrganizationModule } from './api-root-organization/api-root-organization.module'
import { ApiRootUserModule } from './api-root-user/api-root-user.module'
import { ApiStatisticModule } from './api-statistics/api-statistic.module'
import { ApiUserModule } from './api-user/api-user.module'

@Module({
  imports: [
    ApiAuthModule,
    ApiMeModule,
    ApiOrganizationModule,
    ApiRoleModule,
    ApiPermissionModule,
    ApiRootOrganizationModule,
    ApiRootUserModule,
    ApiUserModule,
    ApiCustomerModule,
    ApiCustomerPaymentModule,
    ApiDistributorModule,
    ApiDistributorPaymentModule,
    ApiInvoiceModule,
    ApiInvoiceItemModule,
    ApiProductModule,
    ApiProductBatchModule,
    ApiProductMovementModule,
    ApiProcedureModule,
    ApiReceiptModule,
    ApiStatisticModule,
  ],
  controllers: [],
  providers: [],
})
export class ApiModule {}
