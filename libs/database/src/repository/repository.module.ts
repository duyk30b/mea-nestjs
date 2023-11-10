import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import {
	Arrival, Customer, CustomerPayment, Diagnosis,
	Distributor, DistributorPayment, Employee,
	Invoice, InvoiceItem, Organization, OrganizationSetting,
	Procedure, Product, ProductBatch,
	ProductMovement, Receipt, ReceiptItem,
} from '../entities'
import {
	ArrivalRepository, CustomerPaymentRepository,
	CustomerRepository, DistributorPaymentRepository, DistributorRepository,
	EmployeeRepository, InvoiceItemRepository, InvoiceProcessRepository,
	InvoiceRepository, OrganizationRepository, ProcedureRepository,
	ProductBatchRepository, ProductMovementRepository, ProductRepository,
	ReceiptProcessRepository, ReceiptRepository,
} from './'

@Global()
@Module({
	imports: [
		TypeOrmModule.forFeature([
			Arrival,
			Customer,
			CustomerPayment,
			Diagnosis,
			Distributor,
			DistributorPayment,
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
		CustomerPaymentRepository,
		DistributorRepository,
		DistributorPaymentRepository,
		EmployeeRepository,
		InvoiceRepository,
		InvoiceProcessRepository,
		InvoiceItemRepository,
		OrganizationRepository,
		ProcedureRepository,
		ProductRepository,
		ProductBatchRepository,
		ProductMovementRepository,
		ReceiptRepository,
		ReceiptProcessRepository,
	],
	exports: [
		ArrivalRepository,
		CustomerRepository,
		CustomerPaymentRepository,
		DistributorRepository,
		DistributorPaymentRepository,
		EmployeeRepository,
		InvoiceRepository,
		InvoiceProcessRepository,
		InvoiceItemRepository,
		OrganizationRepository,
		ProductRepository,
		ProcedureRepository,
		ProductBatchRepository,
		ProductMovementRepository,
		ReceiptRepository,
		ReceiptProcessRepository,
	],
})
export class RepositoryModule { }
