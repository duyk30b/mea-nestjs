import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import {
  Appointment,
  Batch,
  BatchMovement,
  Customer,
  CustomerPayment,
  CustomerSource,
  Distributor,
  DistributorPayment,
  Image,
  Organization,
  Paraclinical,
  ParaclinicalAttribute,
  ParaclinicalGroup,
  Permission,
  PrintHtml,
  Procedure,
  ProcedureGroup,
  Product,
  ProductGroup,
  ProductMovement,
  Receipt,
  ReceiptItem,
  Role,
  Setting,
  Ticket,
  TicketDiagnosis,
  TicketParaclinical,
  TicketProcedure,
  TicketProduct,
  TicketUser,
  User,
  Warehouse,
} from '../entities'
import TicketExpense from '../entities/ticket-expense.entity'
import TicketSurcharge from '../entities/ticket-surcharge.entity'
import UserRole from '../entities/user-role.entity'
import { AppointmentRepository } from './appointment/appointment.repository'
import { BatchMovementRepository } from './batch-movement/bat-movement.repository'
import { BatchRepository } from './batch/batch.repository'
import { CustomerPaymentRepository } from './customer-payment/customer-payment.repository'
import { CustomerSourceRepository } from './customer-source/customer-source.repository'
import { CustomerRepository } from './customer/customer.repository'
import { DistributorPaymentRepository } from './distributor-payment/distributor-payment.repository'
import { DistributorRepository } from './distributor/distributor.repository'
import { ImageRepository } from './image/image.repository'
import { OrganizationRepository } from './organization/organization.repository'
import { ParaclinicalAttributeRepository } from './paraclinical-attribute/paraclinical-attribute.repository'
import { ParaclinicalGroupRepository } from './paraclinical-group/paraclinical-group.repository'
import { ParaclinicalRepository } from './paraclinical/paraclinical.repository'
import { PermissionRepository } from './permission/permission.repository'
import { PrintHtmlRepository } from './print-html/print-html.repository'
import { ProcedureGroupRepository } from './procedure-group/procedure-group.repository'
import { ProcedureRepository } from './procedure/procedure.repository'
import { ProductGroupRepository } from './product-group/product-group.repository'
import { ProductMovementRepository } from './product-movement/product-movement.repository'
import { ProductRepository } from './product/product.repository'
import { ReceiptItemRepository } from './receipt-item/receipt-item.repository'
import { ReceiptCancel } from './receipt/receipt-cancel'
import { ReceiptDraft } from './receipt/receipt-draft'
import { ReceiptPayDebt } from './receipt/receipt-pay-debt'
import { ReceiptPrepayment } from './receipt/receipt-prepayment'
import { ReceiptRefundPrepayment } from './receipt/receipt-refund-prepayment'
import { ReceiptSendProductAndPayment } from './receipt/receipt-send-product-and-payment'
import { ReceiptRepository } from './receipt/receipt.repository'
import { RoleRepository } from './role/role.repository'
import { SettingRepository } from './setting/setting.repository'
import { StatisticReceiptRepository } from './statistic/statistic-receipt.repository'
import { StatisticTicketRepository } from './statistic/statistic-ticket.repository'
import { StatisticRepository } from './statistic/statistic.repository'
import { TicketDiagnosisRepository } from './ticket-diagnosis/ticket-diagnosis.repository'
import { TicketParaclinicalRepository } from './ticket-paraclinical/ticket-paraclinical.repository'
import { TicketProcedureRepository } from './ticket-procedure/ticket-procedure.repository'
import { TicketProductRepository } from './ticket-product/ticket-product.repository'
import { TicketUserRepository } from './ticket-user/ticket-user.repository'
import { TicketPayDebt } from './ticket/ticket-base/ticket-pay-debt'
import { TicketPaymentAndClose } from './ticket/ticket-base/ticket-payment-and-close'
import { TicketPrepayment } from './ticket/ticket-base/ticket-prepayment'
import { TicketSendProduct } from './ticket/ticket-base/ticket-send-product'
import { TicketRepository } from './ticket/ticket-base/ticket.repository'
import { TicketClinicRefundOverpaid } from './ticket/ticket-clinic/ticket-clinic-refund-overpaid'
import { TicketClinicReopen } from './ticket/ticket-clinic/ticket-clinic-reopen'
import { TicketClinicReturnProduct } from './ticket/ticket-clinic/ticket-clinic-return-product'
import { TicketClinicUpdateItemsMoney } from './ticket/ticket-clinic/ticket-clinic-update-items-money'
import { TicketClinicUpdateTicketParaclinicalList } from './ticket/ticket-clinic/ticket-clinic-update-ticket-paraclinical-list'
import { TicketClinicUpdateTicketProcedureList } from './ticket/ticket-clinic/ticket-clinic-update-ticket-procedure-list'
import { TicketClinicUpdateTicketProductList } from './ticket/ticket-clinic/ticket-clinic-update-ticket-product-list'
import { TicketOrderCancel } from './ticket/ticket-order/ticket-order-cancel'
import { TicketOrderDebtSuccessUpdate } from './ticket/ticket-order/ticket-order-debt-success-update'
import { TicketOrderDraftApprovedUpdate } from './ticket/ticket-order/ticket-order-draft-approved-update'
import { TicketOrderRefundOverpaid } from './ticket/ticket-order/ticket-order-refund-overpaid'
import { TicketOrderReturnProductList } from './ticket/ticket-order/ticket-order-return-product-list'
import { TicketOrderDraft } from './ticket/ticket-order/ticket-order.draft'
import { UserRoleRepository } from './user-role/user-role.repository'
import { UserRepository } from './user/user.repository'
import { WarehouseRepository } from './warehouse/warehouse.repository'

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      Batch,
      BatchMovement,
      Customer,
      CustomerPayment,
      CustomerSource,
      Distributor,
      DistributorPayment,
      Image,
      Organization,
      Permission,
      Procedure,
      Product,
      ProductMovement,

      Paraclinical,
      ParaclinicalGroup,
      ParaclinicalAttribute,

      Receipt,
      ReceiptItem,
      Role,
      Setting,
      User,
      UserRole,
      Ticket,
      TicketExpense,
      TicketSurcharge,
      TicketDiagnosis,
      TicketProcedure,
      TicketProduct,
      TicketParaclinical,
      TicketUser,

      Warehouse,
      ProductGroup,
      ProcedureGroup,
      PrintHtml,
    ]),
  ],
  providers: [
    AppointmentRepository,
    BatchRepository,
    BatchMovementRepository,
    CustomerRepository,
    CustomerPaymentRepository,
    CustomerSourceRepository,
    DistributorRepository,
    DistributorPaymentRepository,
    ImageRepository,
    OrganizationRepository,
    PermissionRepository,
    ProcedureRepository,
    ProductRepository,
    ProductMovementRepository,

    ParaclinicalRepository,
    ParaclinicalAttributeRepository,
    ParaclinicalGroupRepository,

    ReceiptDraft,
    ReceiptPayDebt,
    ReceiptPrepayment,
    ReceiptRefundPrepayment,
    ReceiptCancel,
    ReceiptSendProductAndPayment,
    ReceiptRepository,
    ReceiptItemRepository,
    RoleRepository,
    SettingRepository,
    UserRepository,
    UserRoleRepository,

    WarehouseRepository,
    ProductGroupRepository,
    ProcedureGroupRepository,
    PrintHtmlRepository,

    TicketClinicUpdateTicketProcedureList,
    TicketClinicUpdateTicketParaclinicalList,
    TicketClinicUpdateTicketProductList,
    TicketClinicUpdateItemsMoney,
    TicketClinicReturnProduct,
    TicketClinicRefundOverpaid,
    TicketClinicReopen,
    TicketPaymentAndClose,
    TicketPayDebt,
    TicketPrepayment,
    TicketSendProduct,
    TicketOrderDraft,
    TicketOrderDraftApprovedUpdate,
    TicketOrderDebtSuccessUpdate,
    TicketOrderReturnProductList,
    TicketOrderRefundOverpaid,
    TicketOrderCancel,
    TicketRepository,
    TicketDiagnosisRepository,
    TicketProcedureRepository,
    TicketProductRepository,
    TicketUserRepository,
    TicketParaclinicalRepository,

    StatisticRepository,
    StatisticReceiptRepository,
    StatisticTicketRepository,
  ],
  exports: [
    AppointmentRepository,
    BatchRepository,
    BatchMovementRepository,
    CustomerRepository,
    CustomerPaymentRepository,
    CustomerSourceRepository,
    DistributorRepository,
    DistributorPaymentRepository,
    ImageRepository,
    OrganizationRepository,
    PermissionRepository,
    ProductRepository,
    ProcedureRepository,
    ProductMovementRepository,

    ParaclinicalRepository,
    ParaclinicalGroupRepository,
    ParaclinicalAttributeRepository,

    ReceiptRepository,
    RoleRepository,
    ReceiptDraft,
    ReceiptPayDebt,
    ReceiptPrepayment,
    ReceiptRefundPrepayment,
    ReceiptCancel,
    ReceiptSendProductAndPayment,
    ReceiptRepository,
    ReceiptItemRepository,
    SettingRepository,
    UserRepository,
    UserRoleRepository,

    WarehouseRepository,
    ProductGroupRepository,
    ProcedureGroupRepository,
    PrintHtmlRepository,

    TicketClinicUpdateTicketProcedureList,
    TicketClinicUpdateTicketParaclinicalList,
    TicketClinicUpdateTicketProductList,
    TicketClinicUpdateItemsMoney,
    TicketClinicReturnProduct,
    TicketClinicRefundOverpaid,
    TicketClinicReopen,
    TicketPaymentAndClose,
    TicketPayDebt,
    TicketPrepayment,
    TicketSendProduct,
    TicketOrderDraft,
    TicketOrderDraftApprovedUpdate,
    TicketOrderDebtSuccessUpdate,
    TicketOrderRefundOverpaid,
    TicketOrderReturnProductList,
    TicketOrderCancel,
    TicketRepository,
    TicketDiagnosisRepository,
    TicketProcedureRepository,
    TicketProductRepository,
    TicketParaclinicalRepository,
    TicketUserRepository,

    StatisticRepository,
    StatisticReceiptRepository,
    StatisticTicketRepository,
  ],
})
export class RepositoryModule { }
