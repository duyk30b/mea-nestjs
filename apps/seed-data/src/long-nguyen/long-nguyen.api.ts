import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { InjectEntityManager } from '@nestjs/typeorm'
import { OrganizationSetting, Product, ProductBatch } from '_libs/database/entities'
import { OrganizationSettingType } from '_libs/database/entities/organization-setting.entity'
import { ArrivalInvoiceRepository, CustomerDebtRepository, PurchaseReceiptRepository } from '_libs/database/repository'
import { DataSource, EntityManager } from 'typeorm'
import { productExampleData, productGroupExampleData } from './product.example'

@ApiTags('LongNguyen Data')
@ApiBearerAuth('access-token')
@Controller('long-nguyen')
export class LongNguyenApi {
	constructor(
		private dataSource: DataSource,
		@InjectEntityManager() private manager: EntityManager,
		private purchaseReceiptRepository: PurchaseReceiptRepository,
		private customerDebtRepository: CustomerDebtRepository,
		private arrivalInvoiceRepository: ArrivalInvoiceRepository
	) {
	}

	@Get('start')
	async startSeedData() {
		const startDate = Date.now()
		console.log('======== [START]: Seed data ========')
		const oid = 3

		console.log('🚀 ======== SEED: organization config ========')
		const orgProductGroupSetting = this.manager.create(OrganizationSetting, {
			oid,
			type: OrganizationSettingType.PRODUCT_GROUP,
			data: JSON.stringify(productGroupExampleData),
		})
		await this.manager.save(OrganizationSetting, orgProductGroupSetting)

		console.log('🚀 ======== SEED: product ========')
		const productsSnap = productExampleData.map((item) => {
			const snap = new Product()
			snap.oid = oid
			snap.brandName = item.brandName
			snap.substance = item.substance
			snap.group = Object.keys(productGroupExampleData).find((i) => productGroupExampleData[i] === item.group)
			snap.unit = JSON.stringify([{ name: item.unit, rate: 1 }])
			snap.route = item.route
			snap.source = item.source
			snap['costPrice'] = item.costPrice
			snap['expiryDate'] = item.expiryDate
			snap['retailPrice'] = item.retailPrice
			return snap
		})
		const products = await this.manager.save(productsSnap)

		const productBatchListSnap = products.map((item) => {
			const productBatch = new ProductBatch()
			productBatch.oid = oid
			productBatch.productId = item.id
			productBatch.expiryDate = item['expiryDate']
			productBatch.costPrice = (item['costPrice'] || 0) * 1000
			productBatch.retailPrice = (item['retailPrice'] || 0) * 1000
			productBatch.wholesalePrice = (item['wholesalePrice'] || 0) * 1000

			return productBatch
		})
		await this.manager.save(productBatchListSnap)

		const endDate = Date.now()
		const time = endDate - startDate
		console.log(`======== [SUCCESS] - ${time}ms ========`)
		return { time }
	}
}
