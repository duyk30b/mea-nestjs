import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import {
	Arrival, Customer, CustomerDebt, Diagnosis, Distributor, DistributorDebt, Employee,
	Invoice, InvoiceItem, Organization, OrganizationSetting,
	Procedure, Product, ProductBatch, ProductMovement, Purchase, Receipt, ReceiptItem,
} from '../entities'
import { ArrivalInvoiceRepository } from './arrival/arrival-invoice.repository'
import { ArrivalRepository } from './arrival/arrival.repository'
import { CustomerDebtRepository } from './customer-debt/customer-debt.repository'
import { CustomerRepository } from './customer/customer.repository'
import { DistributorDebtRepository } from './distributor-debt/distributor-debt.repository'
import { DistributorRepository } from './distributor/distributor.repository'
import { EmployeeRepository } from './employee/employee.repository'
import { InvoiceItemRepository } from './invoice-item/invoice-item.repository'
import { InvoiceRepository } from './invoice/invoice.repository'
import { OrganizationRepository } from './organization/organization.repository'
import { ProcedureRepository } from './procedure/procedure.repository'
import { ProductBatchRepository } from './product-batch/product-batch.repository'
import { ProductMovementRepository } from './product-movement/product-movement.repository'
import { ProductRepository } from './product/product.repository'
import { PurchaseReceiptRepository } from './purchase/purchase-receipt.repository'
import { PurchaseRepository } from './purchase/purchase.repository'
import { ReceiptRepository } from './receipt/receipt.repository'

@Global()
@Module({
	imports: [
		TypeOrmModule.forFeature([
			Arrival,
			Customer,
			CustomerDebt,
			Diagnosis,
			Distributor,
			DistributorDebt,
			Employee,
			Invoice,
			InvoiceItem,
			Organization,
			OrganizationSetting,
			Procedure,
			Product,
			ProductBatch,
			ProductMovement,
			Purchase,
			Receipt,
			ReceiptItem,
		]),
	],
	providers: [
		ArrivalRepository,
		ArrivalInvoiceRepository,
		CustomerRepository,
		CustomerDebtRepository,
		DistributorRepository,
		DistributorDebtRepository,
		EmployeeRepository,
		InvoiceRepository,
		InvoiceItemRepository,
		OrganizationRepository,
		ProcedureRepository,
		ProductRepository,
		ProductBatchRepository,
		ProductMovementRepository,
		PurchaseRepository,
		PurchaseReceiptRepository,
		ReceiptRepository,
	],
	exports: [
		ArrivalRepository,
		ArrivalInvoiceRepository,
		CustomerRepository,
		CustomerDebtRepository,
		DistributorRepository,
		DistributorDebtRepository,
		EmployeeRepository,
		InvoiceRepository,
		InvoiceItemRepository,
		OrganizationRepository,
		ProductRepository,
		ProcedureRepository,
		ProductBatchRepository,
		ProductMovementRepository,
		PurchaseRepository,
		PurchaseReceiptRepository,
		ReceiptRepository,
	],
})
export class RepositoryModule { }
