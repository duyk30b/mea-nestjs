import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import {
  Batch,
  BatchMovement,
  Customer,
  CustomerPayment,
  Distributor,
  DistributorPayment,
  Invoice,
  InvoiceExpense,
  InvoiceItem,
  InvoiceSurcharge,
  Organization,
  OrganizationSetting,
  Procedure,
  Product,
  ProductMovement,
  Receipt,
  ReceiptItem,
  Role,
  User,
} from '../entities'
import Permission from '../entities/permission.entity'
import { BatchMovementRepository } from './batch/bat-movement.repository'
import { BatchRepository } from './batch/batch.repository'
import { CustomerPaymentRepository } from './customer/customer-payment.repository'
import { CustomerRepository } from './customer/customer.repository'
import { DistributorPaymentRepository } from './distributor/distributor-payment.repository'
import { DistributorRepository } from './distributor/distributor.repository'
import { InvoiceItemRepository } from './invoice-item/invoice-item.repository'
import { InvoiceProcessRepository } from './invoice/invoice-process.repository'
import { InvoiceRefund } from './invoice/invoice-refund'
import { InvoiceShipAndPayment } from './invoice/invoice-ship-and-payment'
import { InvoiceRepository } from './invoice/invoice.repository'
import { OrganizationSettingRepository } from './organization-setting/organization-setting.repository'
import { OrganizationRepository } from './organization/organization.repository'
import { PermissionRepository } from './permission/permission.repository'
import { ProcedureRepository } from './procedure/procedure.repository'
import { ProductMovementRepository } from './product/product-movement.repository'
import { ProductRepository } from './product/product.repository'
import { ReceiptItemRepository } from './receipt-item/receipt-item.repository'
import { ReceiptProcessRepository } from './receipt/receipt-process.repository'
import { ReceiptRefund } from './receipt/receipt-refund'
import { ReceiptShipAndPayment } from './receipt/receipt-ship-and-payment'
import { ReceiptRepository } from './receipt/receipt.repository'
import { RoleRepository } from './role/role.repository'
import { StatisticRepository } from './statistic/statistic.repository'
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
      Invoice,
      InvoiceItem,
      InvoiceSurcharge,
      InvoiceExpense,
      Organization,
      OrganizationSetting,
      Permission,
      Procedure,
      Product,
      ProductMovement,
      Receipt,
      ReceiptItem,
      Role,
      User,
    ]),
  ],
  providers: [
    BatchRepository,
    BatchMovementRepository,
    CustomerRepository,
    CustomerPaymentRepository,
    DistributorRepository,
    DistributorPaymentRepository,
    InvoiceRepository,
    InvoiceProcessRepository,
    InvoiceShipAndPayment,
    InvoiceRefund,
    InvoiceItemRepository,
    OrganizationRepository,
    OrganizationSettingRepository,
    PermissionRepository,
    ProcedureRepository,
    ProductRepository,
    ProductMovementRepository,
    ReceiptRepository,
    ReceiptProcessRepository,
    ReceiptShipAndPayment,
    ReceiptRefund,
    ReceiptItemRepository,
    RoleRepository,
    StatisticRepository,
    UserRepository,
  ],
  exports: [
    BatchRepository,
    BatchMovementRepository,
    CustomerRepository,
    CustomerPaymentRepository,
    DistributorRepository,
    DistributorPaymentRepository,
    InvoiceRepository,
    InvoiceProcessRepository,
    InvoiceShipAndPayment,
    InvoiceRefund,
    InvoiceItemRepository,
    OrganizationRepository,
    OrganizationSettingRepository,
    PermissionRepository,
    ProductRepository,
    ProcedureRepository,
    ProductMovementRepository,
    ReceiptRepository,
    RoleRepository,
    ReceiptProcessRepository,
    ReceiptShipAndPayment,
    ReceiptRefund,
    ReceiptItemRepository,
    StatisticRepository,
    UserRepository,
  ],
})
export class RepositoryModule {}
