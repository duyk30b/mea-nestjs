import { Module } from '@nestjs/common'
import { ApiBatchMovementModule } from './api-batch-movement/api-batch-movement.module'
import { ApiBatchModule } from './api-batch/api-batch.module'
import { ApiCustomerPaymentModule } from './api-customer-payment/api-customer-payment.module'
import { ApiCustomerModule } from './api-customer/api-customer.module'
import { ApiDistributorPaymentModule } from './api-distributor-payment/api-distributor-payment.module'
import { ApiDistributorModule } from './api-distributor/api-distributor.module'
import { ApiOrganizationModule } from './api-organization/api-organization.module'
import { ApiPermissionModule } from './api-permission/api-permission.module'
import { ApiProcedureModule } from './api-procedure/api-procedure.module'
import { ApiProductMovementModule } from './api-product-movement/api-product-movement.module'
import { ApiProductModule } from './api-product/api-product.module'
import { ApiRadiologyModule } from './api-radiology/api-radiology.module'
import { ApiReceiptItemModule } from './api-receipt-item/api-receipt-item.module'
import { ApiReceiptModule } from './api-receipt/api-receipt.module'
import { ApiRoleModule } from './api-role/api-role.module'
import { ApiSettingModule } from './api-setting/api-setting.module'
import { ApiStatisticModule } from './api-statistics/api-statistic.module'
import { ApiTicketClinicModule } from './api-ticket-clinic/api-ticket-clinic.module'
import { ApiTicketDiagnosisModule } from './api-ticket-diagnosis/api-ticket-diagnosis.module'
import { ApiTicketOrderModule } from './api-ticket-order/api-ticket-order.module'
import { ApiTicketProcedureModule } from './api-ticket-procedure/api-ticket-procedure.module'
import { ApiTicketProductModule } from './api-ticket-product/api-ticket-product.module'
import { ApiTicketRadiologyModule } from './api-ticket-radiology/api-ticket-radiology.module'
import { ApiTicketModule } from './api-ticket/api-ticket.module'
import { ApiUserModule } from './api-user/api-user.module'

@Module({
  imports: [
    ApiBatchModule,
    ApiBatchMovementModule,
    ApiCustomerModule,
    ApiCustomerPaymentModule,
    ApiDistributorModule,
    ApiDistributorPaymentModule,
    ApiOrganizationModule,
    ApiPermissionModule,
    ApiProcedureModule,
    ApiProductModule,
    ApiProductMovementModule,
    ApiRadiologyModule,
    ApiReceiptModule,
    ApiReceiptItemModule,
    ApiRoleModule,
    ApiSettingModule,
    ApiStatisticModule,
    ApiUserModule,
    ApiTicketModule,
    ApiTicketOrderModule,
    ApiTicketProcedureModule,
    ApiTicketProductModule,
    ApiTicketClinicModule,
    ApiTicketDiagnosisModule,
    ApiTicketRadiologyModule,
  ],
  controllers: [],
  providers: [],
})
export class ApiModule { }
