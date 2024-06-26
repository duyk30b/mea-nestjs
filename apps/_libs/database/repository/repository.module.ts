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
  Invoice,
  InvoiceExpense,
  InvoiceItem,
  InvoiceSurcharge,
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
  Visit,
  VisitBatch,
  VisitDiagnosis,
  VisitProcedure,
  VisitProduct,
  VisitRadiology,
} from '../entities'
import VisitExpense from '../entities/visit-expense.entity'
import VisitSurcharge from '../entities/visit-surcharge.entity'
import { BatchMovementRepository } from './batch-movement/bat-movement.repository'
import { BatchRepository } from './batch/batch.repository'
import { CustomerPaymentRepository } from './customer-payment/customer-payment.repository'
import { CustomerRepository } from './customer/customer.repository'
import { DistributorPaymentRepository } from './distributor-payment/distributor-payment.repository'
import { DistributorRepository } from './distributor/distributor.repository'
import { ImageRepository } from './image/image.repository'
import { InvoiceItemRepository } from './invoice-item/invoice-item.repository'
import { InvoiceDraft } from './invoice/invoice-draft'
import { InvoicePayDebt } from './invoice/invoice-pay-debt'
import { InvoicePrepayment } from './invoice/invoice-prepayment'
import { InvoiceRefundPrepayment } from './invoice/invoice-refund-prepayment'
import { InvoiceReturnProduct } from './invoice/invoice-return-product'
import { InvoiceSendProductAndPayment } from './invoice/invoice-send-product-and-payment'
import { InvoiceRepository } from './invoice/invoice.repository'
import { OrganizationRepository } from './organization/organization.repository'
import { PermissionRepository } from './permission/permission.repository'
import { ProcedureRepository } from './procedure/procedure.repository'
import { ProductMovementRepository } from './product-movement/product-movement.repository'
import { ProductRepository } from './product/product.repository'
import { RadiologyRepository } from './radiology/radiology.repository'
import { ReceiptItemRepository } from './receipt-item/receipt-item.repository'
import { ReceiptDraft } from './receipt/receipt-draft'
import { ReceiptPayDebt } from './receipt/receipt-pay-debt'
import { ReceiptPrepayment } from './receipt/receipt-prepayment'
import { ReceiptRefundPrepayment } from './receipt/receipt-refund-prepayment'
import { ReceiptReturnProduct } from './receipt/receipt-return-product'
import { ReceiptSendProductAndPayment } from './receipt/receipt-send-product-and-payment'
import { ReceiptRepository } from './receipt/receipt.repository'
import { RoleRepository } from './role/role.repository'
import { SettingRepository } from './setting/setting.repository'
import { StatisticInvoiceRepository } from './statistic/statistic-invoice.repository'
import { StatisticReceiptRepository } from './statistic/statistic-receipt.repository'
import { StatisticVisitRepository } from './statistic/statistic-visit.repository'
import { StatisticRepository } from './statistic/statistic.repository'
import { UserRepository } from './user/user.repository'
import { VisitBatchRepository } from './visit-batch/visit-batch.repository'
import { VisitDiagnosisRepository } from './visit-diagnosis/visit-diagnosis.repository'
import { VisitProcedureRepository } from './visit-procedure/visit-procedure.repository'
import { VisitProductRepository } from './visit-product/visit-product.repository'
import { VisitRadiologyRepository } from './visit-radiology/visit-radiology.repository'
import { InvoiceVisitRepository } from './visit/invoice-visit/invoice-visit.repository'
import { VisitClose } from './visit/visit-close'
import { VisitItemsMoney } from './visit/visit-items-money'
import { VisitPayDebt } from './visit/visit-pay-debt'
import { VisitPrepayment } from './visit/visit-prepayment'
import { VisitRefundOverpaid } from './visit/visit-refund-overpaid'
import { VisitReopen } from './visit/visit-reopen'
import { VisitReplaceVisitProcedureList } from './visit/visit-replace-visit-procedure-list'
import { VisitReplaceVisitProductList } from './visit/visit-replace-visit-product-list'
import { VisitReplaceVisitRadiologyList } from './visit/visit-replace-visit-radiology-list'
import { VisitReturnProduct } from './visit/visit-return-product'
import { VisitSendProduct } from './visit/visit-send-product'
import { VisitRepository } from './visit/visit.repository'

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
      Invoice,
      InvoiceItem,
      InvoiceSurcharge,
      InvoiceExpense,
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
      Visit,
      VisitExpense,
      VisitSurcharge,
      VisitBatch,
      VisitDiagnosis,
      VisitProcedure,
      VisitProduct,
      VisitRadiology,
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
    InvoiceDraft,
    InvoicePayDebt,
    InvoicePrepayment,
    InvoiceRefundPrepayment,
    InvoiceReturnProduct,
    InvoiceSendProductAndPayment,
    InvoiceRepository,
    InvoiceItemRepository,
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
    ReceiptReturnProduct,
    ReceiptSendProductAndPayment,
    ReceiptRepository,
    ReceiptItemRepository,
    RoleRepository,
    SettingRepository,
    StatisticRepository,
    StatisticReceiptRepository,
    StatisticInvoiceRepository,
    StatisticVisitRepository,
    UserRepository,
    VisitClose,
    InvoiceVisitRepository,
    VisitItemsMoney,
    VisitPayDebt,
    VisitPrepayment,
    VisitRefundOverpaid,
    VisitReopen,
    VisitReplaceVisitProcedureList,
    VisitReplaceVisitProductList,
    VisitReplaceVisitRadiologyList,
    VisitReturnProduct,
    VisitSendProduct,
    VisitRepository,
    VisitBatchRepository,
    VisitDiagnosisRepository,
    VisitProcedureRepository,
    VisitProductRepository,
    VisitRadiologyRepository,
  ],
  exports: [
    BatchRepository,
    BatchMovementRepository,
    CustomerRepository,
    CustomerPaymentRepository,
    DistributorRepository,
    DistributorPaymentRepository,
    ImageRepository,
    InvoiceDraft,
    InvoicePayDebt,
    InvoicePrepayment,
    InvoiceRefundPrepayment,
    InvoiceReturnProduct,
    InvoiceSendProductAndPayment,
    InvoiceRepository,
    InvoiceItemRepository,
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
    ReceiptReturnProduct,
    ReceiptSendProductAndPayment,
    ReceiptRepository,
    ReceiptItemRepository,
    SettingRepository,
    StatisticRepository,
    StatisticReceiptRepository,
    StatisticInvoiceRepository,
    StatisticVisitRepository,
    UserRepository,
    VisitClose,
    InvoiceVisitRepository,
    VisitItemsMoney,
    VisitPayDebt,
    VisitPrepayment,
    VisitRefundOverpaid,
    VisitReopen,
    VisitReplaceVisitProcedureList,
    VisitReplaceVisitProductList,
    VisitReplaceVisitRadiologyList,
    VisitReturnProduct,
    VisitSendProduct,
    VisitRepository,
    VisitBatchRepository,
    VisitDiagnosisRepository,
    VisitProcedureRepository,
    VisitProductRepository,
    VisitRadiologyRepository,
  ],
})
export class RepositoryModule {}
