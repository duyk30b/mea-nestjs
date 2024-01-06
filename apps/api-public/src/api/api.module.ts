import { Module } from '@nestjs/common'
import { ApiCustomerPaymentModule } from './api-customer-payment/api-customer-payment.module'
import { ApiCustomerModule } from './api-customer/api-customer.module'
import { ApiDistributorPaymentModule } from './api-distributor-payment/api-distributor-payment.module'
import { ApiDistributorModule } from './api-distributor/api-distributor.module'
import { ApiInvoiceItemModule } from './api-invoice-item/api-invoice-item.module'
import { ApiInvoiceModule } from './api-invoice/api-invoice.module'
import { ApiOrganizationModule } from './api-organization/api-organization.module'
import { ApiProcedureModule } from './api-procedure/api-procedure.module'
import { ApiProductBatchModule } from './api-product-batch/api-product-batch.module'
import { ApiProductMovementModule } from './api-product-movement/api-product-movement.module'
import { ApiProductModule } from './api-product/api-product.module'
import { ApiReceiptModule } from './api-receipt/api-receipt.module'
import { ApiStatisticModule } from './api-statistics/api-statistic.module'
import { ApiUserModule } from './api-user/api-user.module'
import { AuthModule } from './auth/auth.module'

@Module({
    imports: [
        AuthModule,
        ApiCustomerModule,
        ApiCustomerPaymentModule,
        ApiDistributorModule,
        ApiDistributorPaymentModule,
        ApiUserModule,
        ApiInvoiceModule,
        ApiInvoiceItemModule,
        ApiOrganizationModule,
        ApiProductModule,
        ApiProductBatchModule,
        ApiProductMovementModule,
        ApiProcedureModule,
        ApiReceiptModule,
        ApiStatisticModule,
        ApiUserModule,
    ],
    controllers: [],
    providers: [],
})
export class ApiModule {}
