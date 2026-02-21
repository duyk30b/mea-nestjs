import { Module } from '@nestjs/common'
import { ApiAddressModule } from './api-address/api-address.module'
import { ApiAppointmentModule } from './api-appointment/api-appointment.module'
import { ApiBatchModule } from './api-batch/api-batch.module'
import { ApiCustomerSourceModule } from './api-customer-source/api-customer-source.module'
import { ApiCustomerModule } from './api-customer/api-customer.module'
import { ApiDistributorModule } from './api-distributor/api-distributor.module'
import { ApiExpenseModule } from './api-expense/api-expense.module'
import { ApiICDModule } from './api-icd/api-icd.module'
import { ApiLaboratorySampleModule } from './api-laboratory-sample/api-laboratory-sample.module'
import { ApiOrganizationModule } from './api-organization/api-organization.module'
import { ApiPaymentModule } from './api-payment/api-payment.module'
import { ApiPermissionModule } from './api-permission/api-permission.module'
import { ApiPrescriptionSampleModule } from './api-prescription-sample/api-prescription-sample.module'
import { ApiPrintHtmlSettingModule } from './api-print-html-setting/api-print-html-setting.module'
import { ApiPrintHtmlModule } from './api-print-html/api-print-html.module'
import { ApiProcedureGroupModule } from './api-procedure-group/api-procedure-group.module'
import { ApiProductGroupModule } from './api-product-group/api-product-group.module'
import { ApiProductMovementModule } from './api-product-movement/api-product-movement.module'
import { ApiProductModule } from './api-product/api-product.module'
import { ApiPurchaseOrderItemModule } from './api-purchase-order-item/api-purchase-order-item.module'
import { ApiRadiologySampleModule } from './api-radiology-sample/api-radiology-sample.module'
import { ApiRoleModule } from './api-role/api-role.module'
import { ApiRoomModule } from './api-room/api-room.module'
import { ApiSettingModule } from './api-setting/api-setting.module'
import { ApiStockCheckModule } from './api-stock-check/api-stock-check.module'
import { ApiTicketBatchModule } from './api-ticket-batch/api-ticket-batch.module'
import { ApiTicketLaboratoryGroupModule } from './api-ticket-laboratory-group/api-ticket-laboratory-group.module'
import { ApiTicketLaboratoryModule } from './api-ticket-laboratory/api-ticket-laboratory.module'
import { ApiTicketProcedureModule } from './api-ticket-procedure/api-ticket-procedure.module'
import { ApiTicketProductModule } from './api-ticket-product/api-ticket-product.module'
import { ApiTicketRadiologyModule } from './api-ticket-radiology/api-ticket-radiology.module'
import { ApiTicketRegimenModule } from './api-ticket-regimen/api-ticket-regimen.module'
import { ApiTicketUserModule } from './api-ticket-user/api-ticket-user.module'
import { ApiUserRoleModule } from './api-user-role/api-user-role.module'
import { ApiUserRoomModule } from './api-user-room/api-user-room.module'
import { ApiUserModule } from './api-user/api-user.module'
import { ApiWalletModule } from './api-wallet/api-wallet.module'
import { ApiWarehouseModule } from './api-warehouse/api-warehouse.module'
import { MasterDataModule } from './master-data/master-data.module'
import { ApiPurchaseOrderModule } from './purchase-order/api-purchase-order.module'
import { StatisticModule } from './statistics/statistic.module'
import { TicketReceptionModule } from './ticket-reception/ticket-reception.module'
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
    ApiTicketUserModule,
    ApiTicketProcedureModule,
    ApiTicketRegimenModule,
    ApiTicketProductModule,
    ApiTicketBatchModule,
    ApiTicketLaboratoryModule,
    ApiTicketLaboratoryGroupModule,
    ApiTicketRadiologyModule,

    ApiRoomModule,
    ApiProcedureGroupModule,
    MasterDataModule,
    ApiPrintHtmlModule,
    ApiPrintHtmlSettingModule,
    ApiWarehouseModule,
    ApiWalletModule,
    ApiExpenseModule,
    ApiCustomerSourceModule,

    ApiLaboratorySampleModule,
    ApiPrescriptionSampleModule,
    ApiRadiologySampleModule,

    TicketModule,
    TicketReceptionModule,
  ],
  controllers: [],
  providers: [],
})
export class ApiModule { }
