import { Logger } from '@nestjs/common'
import { Command, CommandRunner } from 'nest-commander'
import { DataSource } from 'typeorm'
import { AddressData } from './address/address.service'
import { ArrivalInvoiceSeed } from './service/arrival-invoice.seed'
import { CustomerSeed } from './service/customer.seed'
import { DistributorSeed } from './service/distributor.seed'
import { EmployeeSeed } from './service/employee.seed'
import { OrganizationSeed } from './service/organization.seed'
import { ProcedureSeed } from './service/procedure.seed'
import { ProductSeed } from './service/product.seed'
import { PurchaseSeed } from './service/purchase.seed'

@Command({ name: 'start:seed' })
export class SeedDataCommand extends CommandRunner {
	private readonly logger = new Logger(SeedDataCommand.name)

	constructor(
		private readonly dataSource: DataSource,
		private readonly organizationSeed: OrganizationSeed,
		private readonly employeeSeed: EmployeeSeed,
		private readonly distributorSeed: DistributorSeed,
		private readonly customerSeed: CustomerSeed,
		private readonly productSeed: ProductSeed,
		private readonly arrivalInvoiceSeed: ArrivalInvoiceSeed,
		// private readonly diagnosisSeed: DiagnosisSeed,
		private readonly purchaseSeed: PurchaseSeed,
		private readonly procedureSeed: ProcedureSeed
	) {
		super()
	}

	async run(passedParams: string[], options?: Record<string, any>): Promise<void> {
		try {
			const startDate = Date.now()
			console.log('======== [START]: Seed data ========')
			await AddressData.init()
			const oid = 1

			await this.organizationSeed.start(oid)
			await this.employeeSeed.start(oid, 50)
			await this.distributorSeed.start(oid, 100)
			await this.customerSeed.start(oid, 100)
			await this.productSeed.startCreateProduct(oid)
			await this.procedureSeed.start(oid)

			await this.productSeed.startCreateProductBatch(oid)
			await this.purchaseSeed.start(oid, 200)
			await this.arrivalInvoiceSeed.start(oid, 200, new Date('2023-06-20'), new Date('2023-08-06'))

			// await this.diagnosisSeed.createForAllArrival(oid)

			const endDate = Date.now()
			const time = endDate - startDate
			console.log(`======== [SUCCESS] - ${time}ms ========`)
		} catch (error) {
			this.logger.error(error)
		} finally {
			process.exit()
		}
	}
}
