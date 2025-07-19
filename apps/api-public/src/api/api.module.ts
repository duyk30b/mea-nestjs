import { Module } from '@nestjs/common'
import { ApiAddressModule } from './api-address/api-address.module'
import { ApiAppointmentModule } from './api-appointment/api-appointment.module'
import { ApiBatchModule } from './api-batch/api-batch.module'
import { ApiCustomerSourceModule } from './api-customer-source/api-customer-source.module'
import { ApiCustomerModule } from './api-customer/api-customer.module'
import { ApiDiscountModule } from './api-discount/api-discount.module'
import { ApiDistributorModule } from './api-distributor/api-distributor.module'
import { ApiICDModule } from './api-icd/api-icd.module'
import { ApiLaboratoryGroupModule } from './api-laboratory-group/api-laboratory-group.module'
import { ApiLaboratorySampleModule } from './api-laboratory-sample/api-laboratory-sample.module'
import { ApiLaboratoryModule } from './api-laboratory/api-laboratory.module'
import { ApiOrganizationModule } from './api-organization/api-organization.module'
import { ApiPaymentItemModule } from './api-payment-item/api-payment-item.module'
import { ApiPaymentMethodModule } from './api-payment-method/api-payment-method.module'
import { ApiPaymentModule } from './api-payment/api-payment.module'
import { ApiPermissionModule } from './api-permission/api-permission.module'
import { ApiPositionModule } from './api-position/api-position.module'
import { ApiPrescriptionSampleModule } from './api-prescription-sample/api-prescription-sample.module'
import { ApiPrintHtmlModule } from './api-print-html/api-print-html.module'
import { ApiProcedureGroupModule } from './api-procedure-group/api-procedure-group.module'
import { ApiProcedureModule } from './api-procedure/api-procedure.module'
import { ApiProductGroupModule } from './api-product-group/api-product-group.module'
import { ApiProductMovementModule } from './api-product-movement/api-product-movement.module'
import { ApiProductModule } from './api-product/api-product.module'
import { ApiRadiologyGroupModule } from './api-radiology-group/api-radiology-group.module'
import { ApiRadiologySampleModule } from './api-radiology-sample/api-radiology-sample.module'
import { ApiRadiologyModule } from './api-radiology/api-radiology.module'
import { ApiReceiptItemModule } from './api-receipt-item/api-receipt-item.module'
import { ApiReceiptModule } from './api-receipt/api-receipt.module'
import { ApiRoleModule } from './api-role/api-role.module'
import { ApiRoomModule } from './api-room/api-room.module'
import { ApiSettingModule } from './api-setting/api-setting.module'
import { ApiStatisticModule } from './api-statistics/api-statistic.module'
import { ApiStockCheckModule } from './api-stock-check/api-stock-check.module'
import { ApiTicketBatchModule } from './api-ticket-batch/api-ticket-batch.module'
import { ApiTicketClinicModule } from './api-ticket-clinic/api-ticket-clinic.module'
import { ApiTicketLaboratoryGroupModule } from './api-ticket-laboratory-group/api-ticket-laboratory-group.module'
import { ApiTicketLaboratoryModule } from './api-ticket-laboratory/api-ticket-laboratory.module'
import { ApiTicketOrderModule } from './api-ticket-order/api-ticket-order.module'
import { ApiTicketProcedureModule } from './api-ticket-procedure/api-ticket-procedure.module'
import { ApiTicketProductModule } from './api-ticket-product/api-ticket-product.module'
import { ApiTicketRadiologyModule } from './api-ticket-radiology/api-ticket-radiology.module'
import { ApiUserRoleModule } from './api-user-role/api-user-role.module'
import { ApiUserRoomModule } from './api-user-room/api-user-room.module'
import { ApiUserModule } from './api-user/api-user.module'
import { ApiWarehouseModule } from './api-warehouse/api-warehouse.module'
import { TicketModule } from './ticket/ticket.module'

@Module({
  imports: [
    ApiAddressModule,
    ApiICDModule,

    ApiAppointmentModule,
    ApiBatchModule,
    ApiCustomerModule,
    ApiCustomerSourceModule,
    ApiDistributorModule,
    ApiPermissionModule,
    ApiProcedureModule,
    ApiProductModule,
    ApiProductMovementModule,
    ApiReceiptModule,
    ApiReceiptItemModule,

    ApiStatisticModule,
    ApiSettingModule,

    ApiOrganizationModule,
    ApiRoleModule,
    ApiPositionModule,
    ApiUserModule,
    ApiUserRoleModule,
    ApiUserRoomModule,

    ApiLaboratoryModule,
    ApiLaboratoryGroupModule,
    ApiLaboratorySampleModule,
    ApiRadiologyModule,
    ApiRadiologyGroupModule,
    ApiPrescriptionSampleModule,

    ApiWarehouseModule,
    ApiProductGroupModule,
    ApiProcedureGroupModule,
    ApiPrintHtmlModule,

    ApiTicketOrderModule,
    ApiTicketProcedureModule,
    ApiTicketProductModule,
    ApiTicketBatchModule,
    ApiTicketClinicModule,
    ApiTicketLaboratoryModule,
    ApiTicketLaboratoryGroupModule,
    ApiTicketRadiologyModule,

    ApiStockCheckModule,
    ApiPaymentModule,
    ApiPaymentItemModule,
    ApiPaymentMethodModule,
    ApiDiscountModule,

    ApiRoomModule,
    ApiRadiologySampleModule,
    TicketModule,
  ],
  controllers: [],
  providers: [],
})
export class ApiModule { }
