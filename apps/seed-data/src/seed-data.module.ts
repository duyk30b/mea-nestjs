import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import {
	Arrival, Customer, CustomerDebt, Diagnosis, Distributor, DistributorDebt, Employee,
	Invoice, InvoiceItem, Organization, OrganizationSetting,
	Procedure, Product, ProductBatch, ProductMovement, Purchase, Receipt, ReceiptItem,
} from '_libs/database/entities'
import { RepositoryModule } from '_libs/database/repository'
import { SqlModule } from '_libs/database/sql.module'
import { BuiTrangApi } from './bs-buitrang/bui-trang.api'
import { LongNguyenApi } from './long-nguyen/long-nguyen.api'
import { SeedDataApi } from './seed-data.api'
import { SeedDataCommand } from './seed-data.command'
import { ArrivalInvoiceSeed } from './service/arrival-invoice.seed'
import { CustomerSeed } from './service/customer.seed'
import { DiagnosisSeed } from './service/diagnosis.seed'
import { DistributorSeed } from './service/distributor.seed'
import { EmployeeSeed } from './service/employee.seed'
import { OrganizationSeed } from './service/organization.seed'
import { ProcedureSeed } from './service/procedure.seed'
import { ProductSeed } from './service/product.seed'
import { PurchaseSeed } from './service/purchase.seed'
import { TestApi } from './test-sql.api'

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: [`.env.${process.env.NODE_ENV || 'local'}`, '.env'],
			isGlobal: true,
		}),
		SqlModule,
		TypeOrmModule.forFeature([
			Arrival,
			Customer,
			CustomerDebt,
			Distributor,
			DistributorDebt,
			Diagnosis,
			Employee,
			Invoice,
			InvoiceItem,
			Organization,
			OrganizationSetting,
			Product,
			ProductBatch,
			ProductMovement,
			Purchase,
			Procedure,
			Receipt,
			ReceiptItem,
		]),
		RepositoryModule,
	],
	controllers: [BuiTrangApi, LongNguyenApi, SeedDataApi, TestApi],
	providers: [
		ArrivalInvoiceSeed,
		CustomerSeed,
		DiagnosisSeed,
		DistributorSeed,
		EmployeeSeed,
		OrganizationSeed,
		ProcedureSeed,
		PurchaseSeed,
		ProductSeed,
		SeedDataCommand,
	],
})
export class SeedDataModule { }
