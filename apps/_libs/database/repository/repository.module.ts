import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import {
  Batch,
  BatchMovement,
  Customer,
  CustomerPayment,
  Distributor,
  DistributorPayment,
  Image,
  Organization,
  Permission,
  Procedure,
  Product,
  ProductMovement,
  Radiology,
  Receipt,
  ReceiptItem,
  Role,
  Setting,
  Ticket,
  TicketDiagnosis,
  TicketProcedure,
  TicketProduct,
  TicketRadiology,
  User,
} from '../entities'
import TicketExpense from '../entities/ticket-expense.entity'
import TicketSurcharge from '../entities/ticket-surcharge.entity'
import { BatchMovementRepository } from './batch-movement/bat-movement.repository'
import { BatchRepository } from './batch/batch.repository'
import { CustomerPaymentRepository } from './customer-payment/customer-payment.repository'
import { CustomerRepository } from './customer/customer.repository'
import { DistributorPaymentRepository } from './distributor-payment/distributor-payment.repository'
import { DistributorRepository } from './distributor/distributor.repository'
import { ImageRepository } from './image/image.repository'
import { OrganizationRepository } from './organization/organization.repository'
import { PermissionRepository } from './permission/permission.repository'
import { ProcedureRepository } from './procedure/procedure.repository'
import { ProductMovementRepository } from './product-movement/product-movement.repository'
import { ProductRepository } from './product/product.repository'
import { RadiologyRepository } from './radiology/radiology.repository'
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
import { TicketProcedureRepository } from './ticket-procedure/ticket-procedure.repository'
import { TicketProductRepository } from './ticket-product/ticket-product.repository'
import { TicketRadiologyRepository } from './ticket-radiology/ticket-radiology.repository'
import { TicketPayDebt } from './ticket/ticket-base/ticket-pay-debt'
import { TicketPaymentAndClose } from './ticket/ticket-base/ticket-payment-and-close'
import { TicketPrepayment } from './ticket/ticket-base/ticket-prepayment'
import { TicketSendProduct } from './ticket/ticket-base/ticket-send-product'
import { TicketRepository } from './ticket/ticket-base/ticket.repository'
import { TicketClinicChangeItemsMoney } from './ticket/ticket-clinic/ticket-clinic-change-items-money'
import { TicketClinicChangeTicketProcedureList } from './ticket/ticket-clinic/ticket-clinic-change-ticket-procedure-list'
import { TicketClinicChangeTicketProductList } from './ticket/ticket-clinic/ticket-clinic-change-ticket-product-list'
import { TicketClinicChangeTicketRadiologyList } from './ticket/ticket-clinic/ticket-clinic-change-ticket-radiology-list'
import { TicketClinicRefundOverpaid } from './ticket/ticket-clinic/ticket-clinic-refund-overpaid'
import { TicketClinicReopen } from './ticket/ticket-clinic/ticket-clinic-reopen'
import { TicketClinicReturnProduct } from './ticket/ticket-clinic/ticket-clinic-return-product'
import { TicketOrderCancel } from './ticket/ticket-order/ticket-order-cancel'
import { TicketOrderDebtSuccessUpdate } from './ticket/ticket-order/ticket-order-debt-success-update'
import { TicketOrderDraftApprovedUpdate } from './ticket/ticket-order/ticket-order-draft-approved-update'
import { TicketOrderRefundOverpaid } from './ticket/ticket-order/ticket-order-refund-overpaid'
import { TicketOrderReturnProductList } from './ticket/ticket-order/ticket-order-return-product-list'
import { TicketOrderDraft } from './ticket/ticket-order/ticket-order.draft'
import { UserRepository } from './user/user.repository'

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Batch,
      BatchMovement,
      Customer,
      CustomerPayment,
      Distributor,
      DistributorPayment,
      Image,
      Organization,
      Permission,
      Procedure,
      Product,
      ProductMovement,
      Radiology,
      Receipt,
      ReceiptItem,
      Role,
      Setting,
      User,
      Ticket,
      TicketExpense,
      TicketSurcharge,
      TicketDiagnosis,
      TicketProcedure,
      TicketProduct,
      TicketRadiology,
    ]),
  ],
  providers: [
    BatchRepository,
    BatchMovementRepository,
    CustomerRepository,
    CustomerPaymentRepository,
    DistributorRepository,
    DistributorPaymentRepository,
    ImageRepository,
    OrganizationRepository,
    PermissionRepository,
    ProcedureRepository,
    ProductRepository,
    ProductMovementRepository,
    RadiologyRepository,
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
    TicketClinicChangeTicketProcedureList,
    TicketClinicChangeTicketRadiologyList,
    TicketClinicChangeTicketProductList,
    TicketClinicChangeItemsMoney,
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
    TicketRadiologyRepository,

    StatisticRepository,
    StatisticReceiptRepository,
    StatisticTicketRepository,
  ],
  exports: [
    BatchRepository,
    BatchMovementRepository,
    CustomerRepository,
    CustomerPaymentRepository,
    DistributorRepository,
    DistributorPaymentRepository,
    ImageRepository,
    OrganizationRepository,
    PermissionRepository,
    ProductRepository,
    ProcedureRepository,
    ProductMovementRepository,
    RadiologyRepository,
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
    TicketClinicChangeTicketProcedureList,
    TicketClinicChangeTicketRadiologyList,
    TicketClinicChangeTicketProductList,
    TicketClinicChangeItemsMoney,
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
    TicketRadiologyRepository,

    StatisticRepository,
    StatisticReceiptRepository,
    StatisticTicketRepository,
  ],
})
export class RepositoryModule { }
