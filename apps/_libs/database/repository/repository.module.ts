import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import {
  CustomerPaymentRepository,
  CustomerRepository,
  DistributorPaymentRepository,
  DistributorRepository,
  InvoiceItemRepository,
  InvoiceProcessRepository,
  InvoiceRepository,
  OrganizationRepository,
  ProcedureRepository,
  ProductBatchRepository,
  ProductMovementRepository,
  ProductRepository,
  ReceiptProcessRepository,
  ReceiptRepository,
  StatisticRepository,
  UserRepository,
} from '.'
import {
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
  ProductBatch,
  ProductMovement,
  Receipt,
  ReceiptItem,
  Role,
  User,
} from '../entities'
import Permission from '../entities/permission.entity'
import { OrganizationSettingRepository } from './organization-setting/organization-setting.repository'
import { PermissionRepository } from './permission/permission.repository'
import { RoleRepository } from './role/role.repository'

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
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
      ProductBatch,
      ProductMovement,
      Receipt,
      ReceiptItem,
      Role,
      User,
    ]),
  ],
  providers: [
    CustomerRepository,
    CustomerPaymentRepository,
    DistributorRepository,
    DistributorPaymentRepository,
    InvoiceRepository,
    InvoiceProcessRepository,
    InvoiceItemRepository,
    OrganizationRepository,
    OrganizationSettingRepository,
    PermissionRepository,
    ProcedureRepository,
    ProductRepository,
    ProductBatchRepository,
    ProductMovementRepository,
    ReceiptRepository,
    ReceiptProcessRepository,
    RoleRepository,
    StatisticRepository,
    UserRepository,
  ],
  exports: [
    CustomerRepository,
    CustomerPaymentRepository,
    DistributorRepository,
    DistributorPaymentRepository,
    InvoiceRepository,
    InvoiceProcessRepository,
    InvoiceItemRepository,
    OrganizationRepository,
    OrganizationSettingRepository,
    PermissionRepository,
    ProductRepository,
    ProcedureRepository,
    ProductBatchRepository,
    ProductMovementRepository,
    ReceiptRepository,
    RoleRepository,
    ReceiptProcessRepository,
    StatisticRepository,
    UserRepository,
  ],
})
export class RepositoryModule {}
