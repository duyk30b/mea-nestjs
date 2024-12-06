import { Module } from '@nestjs/common'
import { ApiAppointmentModule } from './api-appointment/api-appointment.module'
import { ApiBatchMovementModule } from './api-batch-movement/api-batch-movement.module'
import { ApiBatchModule } from './api-batch/api-batch.module'
import { ApiCustomerPaymentModule } from './api-customer-payment/api-customer-payment.module'
import { ApiCustomerSourceModule } from './api-customer-source/api-customer-source.module'
import { ApiCustomerModule } from './api-customer/api-customer.module'
import { ApiDistributorPaymentModule } from './api-distributor-payment/api-distributor-payment.module'
import { ApiDistributorModule } from './api-distributor/api-distributor.module'
import { ApiLaboratoryGroupModule } from './api-laboratory-group/api-laboratory-group.module'
import { ApiLaboratoryKitModule } from './api-laboratory-kit/api-laboratory-kit.module'
import { ApiLaboratoryModule } from './api-laboratory/api-laboratory.module'
import { ApiOrganizationModule } from './api-organization/api-organization.module'
import { ApiPermissionModule } from './api-permission/api-permission.module'
import { ApiPrescriptionSampleModule } from './api-prescription-sample/api-prescription-sample.module'
import { ApiPrintHtmlModule } from './api-print-html/api-print-html.module'
import { ApiProcedureGroupModule } from './api-procedure-group/api-procedure-group.module'
import { ApiProcedureModule } from './api-procedure/api-procedure.module'
import { ApiProductGroupModule } from './api-product-group/api-product-group.module'
import { ApiProductMovementModule } from './api-product-movement/api-product-movement.module'
import { ApiProductModule } from './api-product/api-product.module'
import { ApiRadiologyGroupModule } from './api-radiology-group/api-radiology-group.module'
import { ApiRadiologyModule } from './api-radiology/api-radiology.module'
import { ApiReceiptItemModule } from './api-receipt-item/api-receipt-item.module'
import { ApiReceiptModule } from './api-receipt/api-receipt.module'
import { ApiRoleModule } from './api-role/api-role.module'
import { ApiSettingModule } from './api-setting/api-setting.module'
import { ApiStatisticModule } from './api-statistics/api-statistic.module'
import { ApiTicketClinicModule } from './api-ticket-clinic/api-ticket-clinic.module'
import { ApiTicketLaboratoryModule } from './api-ticket-laboratory/api-ticket-laboratory.module'
import { ApiTicketOrderModule } from './api-ticket-order/api-ticket-order.module'
import { ApiTicketProcedureModule } from './api-ticket-procedure/api-ticket-procedure.module'
import { ApiTicketProductModule } from './api-ticket-product/api-ticket-product.module'
import { ApiTicketRadiologyModule } from './api-ticket-radiology/api-ticket-radiology.module'
import { ApiTicketModule } from './api-ticket/api-ticket.module'
import { ApiUserModule } from './api-user/api-user.module'
import { ApiWarehouseModule } from './api-warehouse/api-warehouse.module'

@Module({
  imports: [
    ApiAppointmentModule,
    ApiBatchModule,
    ApiBatchMovementModule,
    ApiCustomerModule,
    ApiCustomerPaymentModule,
    ApiCustomerSourceModule,
    ApiDistributorModule,
    ApiDistributorPaymentModule,
    ApiOrganizationModule,
    ApiPermissionModule,
    ApiProcedureModule,
    ApiProductModule,
    ApiProductMovementModule,
    ApiReceiptModule,
    ApiReceiptItemModule,
    ApiRoleModule,
    ApiSettingModule,
    ApiStatisticModule,
    ApiUserModule,

    ApiLaboratoryModule,
    ApiLaboratoryGroupModule,
    ApiLaboratoryKitModule,
    ApiRadiologyModule,
    ApiRadiologyGroupModule,
    ApiPrescriptionSampleModule,

    ApiWarehouseModule,
    ApiProductGroupModule,
    ApiProcedureGroupModule,
    ApiPrintHtmlModule,

    ApiTicketModule,
    ApiTicketOrderModule,
    ApiTicketProcedureModule,
    ApiTicketProductModule,
    ApiTicketClinicModule,
    ApiTicketLaboratoryModule,
    ApiTicketRadiologyModule,
  ],
  controllers: [],
  providers: [],
})
export class ApiModule { }
