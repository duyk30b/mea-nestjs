import { Module } from '@nestjs/common'
import { ApiAddressModule } from './api-address/api-address.module'
import { ApiAppointmentModule } from './api-appointment/api-appointment.module'
import { ApiBatchModule } from './api-batch/api-batch.module'
import { ApiCustomerSourceModule } from './api-customer-source/api-customer-source.module'
import { ApiCustomerModule } from './api-customer/api-customer.module'
import { ApiDiscountModule } from './api-discount/api-discount.module'
import { ApiDistributorModule } from './api-distributor/api-distributor.module'
import { ApiExpenseModule } from './api-expense/api-expense.module'
import { ApiICDModule } from './api-icd/api-icd.module'
import { ApiLaboratoryGroupModule } from './api-laboratory-group/api-laboratory-group.module'
import { ApiLaboratorySampleModule } from './api-laboratory-sample/api-laboratory-sample.module'
import { ApiLaboratoryModule } from './api-laboratory/api-laboratory.module'
import { ApiOrganizationModule } from './api-organization/api-organization.module'
import { ApiPaymentMethodModule } from './api-payment-method/api-payment-method.module'
import { ApiPaymentModule } from './api-payment/api-payment.module'
import { ApiPermissionModule } from './api-permission/api-permission.module'
import { ApiPositionModule } from './api-position/api-position.module'
import { ApiPrescriptionSampleModule } from './api-prescription-sample/api-prescription-sample.module'
import { ApiPrintHtmlSettingModule } from './api-print-html-setting/api-print-html-setting.module'
import { ApiPrintHtmlModule } from './api-print-html/api-print-html.module'
import { ApiProcedureGroupModule } from './api-procedure-group/api-procedure-group.module'
import { ApiProcedureModule } from './api-procedure/api-procedure.module'
import { ApiProductGroupModule } from './api-product-group/api-product-group.module'
import { ApiProductMovementModule } from './api-product-movement/api-product-movement.module'
import { ApiProductModule } from './api-product/api-product.module'
import { ApiPurchaseOrderItemModule } from './api-purchase-order-item/api-purchase-order-item.module'
import { ApiRadiologyGroupModule } from './api-radiology-group/api-radiology-group.module'
import { ApiRadiologySampleModule } from './api-radiology-sample/api-radiology-sample.module'
import { ApiRadiologyModule } from './api-radiology/api-radiology.module'
import { ApiRegimenModule } from './api-regimen/api-regimen.module'
import { ApiRoleModule } from './api-role/api-role.module'
import { ApiRoomModule } from './api-room/api-room.module'
import { ApiSettingModule } from './api-setting/api-setting.module'
import { ApiStockCheckModule } from './api-stock-check/api-stock-check.module'
import { ApiSurchargeModule } from './api-surcharge/api-surcharge.module'
import { ApiTicketBatchModule } from './api-ticket-batch/api-ticket-batch.module'
import { ApiTicketLaboratoryGroupModule } from './api-ticket-laboratory-group/api-ticket-laboratory-group.module'
import { ApiTicketLaboratoryModule } from './api-ticket-laboratory/api-ticket-laboratory.module'
import { ApiTicketProcedureModule } from './api-ticket-procedure/api-ticket-procedure.module'
import { ApiTicketProductModule } from './api-ticket-product/api-ticket-product.module'
import { ApiTicketRadiologyModule } from './api-ticket-radiology/api-ticket-radiology.module'
import { ApiTicketRegimenModule } from './api-ticket-regimen/api-ticket-regimen.module'
import { ApiUserRoleModule } from './api-user-role/api-user-role.module'
import { ApiUserRoomModule } from './api-user-room/api-user-room.module'
import { ApiUserModule } from './api-user/api-user.module'
import { ApiWarehouseModule } from './api-warehouse/api-warehouse.module'
import { ApiPurchaseOrderModule } from './purchase-order/api-purchase-order.module'
import { StatisticModule } from './statistics/statistic.module'
import { TicketModule } from './ticket/ticket.module'

@Module({
  imports: [
    ApiPermissionModule,
    ApiAddressModule,
    ApiICDModule,

    StatisticModule,
    ApiSettingModule,

    ApiOrganizationModule,
    ApiRoleModule,
    ApiUserModule,
    ApiUserRoleModule,
    ApiUserRoomModule,

    ApiDistributorModule,
    ApiProductModule,
    ApiProductGroupModule,
    ApiBatchModule,
    ApiCustomerModule,

    ApiProductMovementModule,
    ApiPurchaseOrderModule,
    ApiPurchaseOrderItemModule,
    ApiStockCheckModule,
    ApiPaymentModule,

    ApiAppointmentModule,
    ApiTicketProcedureModule,
    ApiTicketRegimenModule,
    ApiTicketProductModule,
    ApiTicketBatchModule,
    ApiTicketLaboratoryModule,
    ApiTicketLaboratoryGroupModule,
    ApiTicketRadiologyModule,

    ApiDiscountModule,

    ApiRoomModule,
    ApiProcedureModule,
    ApiProcedureGroupModule,
    ApiRegimenModule,
    ApiLaboratoryModule,
    ApiLaboratoryGroupModule,
    ApiRadiologyModule,
    ApiRadiologyGroupModule,
    ApiPrintHtmlModule,
    ApiPrintHtmlSettingModule,
    ApiWarehouseModule,
    ApiPaymentMethodModule,
    ApiExpenseModule,
    ApiSurchargeModule,
    ApiPositionModule,
    ApiCustomerSourceModule,

    ApiLaboratorySampleModule,
    ApiPrescriptionSampleModule,
    ApiRadiologySampleModule,

    TicketModule,
  ],
  controllers: [],
  providers: [],
})
export class ApiModule { }
