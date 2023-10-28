import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import {
	Arrival, Customer, CustomerDebt, Diagnosis, Distributor, DistributorDebt, Employee,
	Invoice, InvoiceItem, Organization, OrganizationSetting,
	Procedure, Product, ProductBatch, ProductMovement, Receipt, ReceiptItem,
} from '../entities'
import { ArrivalRepository } from './arrival/arrival.repository'
import { CustomerDebtRepository } from './customer-debt/customer-debt.repository'
import { CustomerRepository } from './customer/customer.repository'
import { DistributorDebtRepository } from './distributor-debt/distributor-debt.repository'
import { DistributorRepository } from './distributor/distributor.repository'
import { EmployeeRepository } from './employee/employee.repository'
import { InvoiceItemRepository } from './invoice-item/invoice-item.repository'
import { InvoiceQuickRepository } from './invoice/invoice-quick.repository'
import { InvoiceRepository } from './invoice/invoice.repository'
import { OrganizationRepository } from './organization/organization.repository'
import { ProcedureRepository } from './procedure/procedure.repository'
import { ProductBatchRepository } from './product-batch/product-batch.repository'
import { ProductMovementRepository } from './product-movement/product-movement.repository'
import { ProductRepository } from './product/product.repository'
import { ReceiptQuickRepository } from './receipt/receipt-quick.repository'
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
			Receipt,
			ReceiptItem,
		]),
	],
	providers: [
		ArrivalRepository,
		CustomerRepository,
		CustomerDebtRepository,
		DistributorRepository,
		DistributorDebtRepository,
		EmployeeRepository,
		InvoiceRepository,
		InvoiceQuickRepository,
		InvoiceItemRepository,
		OrganizationRepository,
		ProcedureRepository,
		ProductRepository,
		ProductBatchRepository,
		ProductMovementRepository,
		ReceiptQuickRepository,
		ReceiptRepository,
	],
	exports: [
		ArrivalRepository,
		CustomerRepository,
		CustomerDebtRepository,
		DistributorRepository,
		DistributorDebtRepository,
		EmployeeRepository,
		InvoiceRepository,
		InvoiceQuickRepository,
		InvoiceItemRepository,
		OrganizationRepository,
		ProductRepository,
		ProcedureRepository,
		ProductBatchRepository,
		ProductMovementRepository,
		ReceiptQuickRepository,
		ReceiptRepository,
	],
})
export class RepositoryModule { }
