import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { InjectEntityManager } from '@nestjs/typeorm'
import { textToTime } from '_libs/common/formatters/time.formatter'
import { convertViToEn } from '_libs/common/helpers/string.helper'
import { DiscountType, InvoiceItemType } from '_libs/database/common/variable'
import { Customer, CustomerDebt, Distributor, OrganizationSetting, Product, ProductBatch } from '_libs/database/entities'
import { OrganizationSettingType } from '_libs/database/entities/organization-setting.entity'
import { ArrivalInvoiceRepository, CustomerDebtRepository, InvoiceItemDto, InvoiceUpsertDto, PurchaseReceiptRepository, ReceiptInsertDto, ReceiptItemDto } from '_libs/database/repository'
import { DataSource, EntityManager } from 'typeorm'
import { customerData } from './customer.data'
import { distributorData } from './distributor.data'
import { invoiceData } from './invoice.data'
import { productData, productGroupData } from './product.data'
import { receiptData } from './receipt.data'

@ApiTags('BuiTrang Data')
@ApiBearerAuth('access-token')
@Controller('bui-trang')
export class BuiTrangApi {
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
		const oid = 2

		// Lưu product_group setting
		await this.seedOrgConfig(oid)

		// Lưu nhà cung cấp
		await this.seedDistributor(oid)

		// Lưu khách hàng
		await this.seedCustomer(oid)

		// Lưu sản phẩm
		await this.seedProduct(oid)

		// Lưu lô hàng
		await this.seedProductBatch(oid)

		await this.seedAllDebtAndInvoiceAndReceiptSortByTime(oid)

		// // Lưu tất cả phiếu nhập
		// await this.seedAllReceipt(oid)

		// // Lưu tất cả phiếu xuất
		// await this.seedAllInvoice(oid)

		const endDate = Date.now()
		const time = endDate - startDate
		console.log(`======== [SUCCESS] - ${time}ms ========`)
		return { time }
	}

	async seedOrgConfig(oid: number) {
		console.log('🚀 ======== SEED: organization config ========')
		const orgProductGroupSetting = this.manager.create(OrganizationSetting, {
			oid,
			type: OrganizationSettingType.PRODUCT_GROUP,
			data: JSON.stringify(productGroupData),
		})
		await this.manager.save(OrganizationSetting, orgProductGroupSetting)
	}

	async seedDistributor(oid: number) {
		console.log('🚀 ======== SEED: distributor ========')
		const distributorsSnap = distributorData.map((item) => {
			const snap = new Distributor()
			snap.oid = oid
			snap.fullNameVi = item.fullNameVi
			snap.fullNameEn = convertViToEn(item.fullNameVi)
			snap.otherId = item.otherId
			return snap
		})
		await this.manager.save(distributorsSnap)
	}

	async seedCustomer(oid: number) {
		console.log('🚀 ======== SEED: customer ========')
		const customersSnap = customerData.map((item) => {
			const snap = new Customer()
			snap.oid = oid
			snap.fullNameVi = item.fullNameVi
			snap.fullNameEn = convertViToEn(item.fullNameVi)
			snap.otherId = item.otherId
			snap.phone = item.phone
			snap.note = item.note
			return snap
		})
		await this.manager.save(customersSnap)
	}

	async seedProduct(oid: number) {
		console.log('🚀 ======== SEED: product ========')
		const productsSnap = productData.map((item) => {
			const snap = new Product()
			snap.oid = oid
			snap.brandName = item.brandName
			snap.otherId = item.otherId
			snap.unit = JSON.stringify([{ name: item.unit, rate: 1 }])
			snap.group = Object.keys(productGroupData).find((i) => productGroupData[i] === item.group)
			return snap
		})
		await this.manager.save(productsSnap)
	}

	async seedProductBatch(oid: number) {
		console.log('🚀 ======== SEED: product batch ========')
		const productList = await this.manager.find(Product, { where: { oid } })

		const productBatchListSnap: ProductBatch[] = []
		receiptData.forEach((r) => {
			r.receiptItems.forEach((item) => {
				const product = productList.find((i) => i.otherId === item.productOtherId)
				if (!product) {
					console.log('🚀 ~ receiptData: product undefined ~ item.productOtherId:', item.productOtherId)
					throw new Error('---- Product undefined ----')
				}
				const existInSnap = productBatchListSnap.find((i) => {
					return i.productId === product.id
						&& i.costPrice === (item.cost * 1000)
						&& i.expiryDate == item.expiryDate
				})
				if (existInSnap) return

				const productRoot = productData.find((i) => i.otherId === item.productOtherId)
				const productBatch = new ProductBatch()
				productBatch.oid = oid
				productBatch.productId = product.id
				productBatch.expiryDate = item.expiryDate
				productBatch.costPrice = item.cost * 1000
				productBatch.retailPrice = productRoot.retailPrice * 1000
				productBatch.wholesalePrice = productRoot.wholesalePrice * 1000

				productBatchListSnap.push(productBatch)
			})
		})

		invoiceData.forEach((r) => {
			r.invoiceItems.forEach((item) => {
				const product = productList.find((i) => i.otherId === item.productOtherId)
				if (!product) {
					console.log('🚀 ~ invoiceData: product undefined ~ item.productOtherId:', item.productOtherId)
					throw new Error('---- Product undefined ----')
				}
				const existInSnap = productBatchListSnap.find((i) => {
					return i.productId === product.id
						&& i.costPrice === (item.costPrice * 1000)
						&& i.expiryDate == item.expiryDate
				})
				if (existInSnap) return

				const productRoot = productData.find((i) => i.otherId === item.productOtherId)
				const productBatch = new ProductBatch()
				productBatch.oid = oid
				productBatch.productId = product.id
				productBatch.expiryDate = item.expiryDate
				productBatch.costPrice = item.costPrice * 1000
				productBatch.retailPrice = productRoot.retailPrice * 1000
				productBatch.wholesalePrice = productRoot.wholesalePrice * 1000

				productBatchListSnap.push(productBatch)
			})
		})

		// Lưu product_batch tu productData
		productData.forEach((item) => {
			const product = productList.find((i) => i.otherId === item.otherId)

			const costBatch = Object.keys(item.stockAvail)
			if (costBatch.length) {
				costBatch.forEach((i) => {
					const [exp, cost] = i.split('-')
					const expiryDate = Number(exp) || null
					const costPrice = Number(cost) * 1000

					const existInSnap = productBatchListSnap.find((j) => {
						return j.productId === product.id
							&& j.costPrice === costPrice
							&& j.expiryDate == expiryDate
					})
					if (existInSnap) return

					const productBatch = new ProductBatch()
					productBatch.oid = oid
					productBatch.productId = product.id
					productBatch.expiryDate = expiryDate
					productBatch.costPrice = costPrice
					productBatch.retailPrice = item.retailPrice * 1000
					productBatch.wholesalePrice = item.wholesalePrice * 1000

					productBatchListSnap.push(productBatch)
				})
			}
		})
		await this.manager.save(ProductBatch, productBatchListSnap)
	}

	async seedAllDebtAndInvoiceAndReceiptSortByTime(oid: number) {
		const customerList = await this.manager.find(Customer, { where: { oid } })
		const distributorList = await this.manager.find(Distributor, { where: { oid } })
		const productList = await this.manager.find(Product, {
			where: { oid },
			relations: { productBatches: true },
		})

		const itemsAction = []
		// thêm tất cả phiếu nhập
		for (let i = receiptData.length - 1; i >= 0; i--) { // vì đang lưu mảng ngược
			const receipt = receiptData[i]

			const receiptItemsDto: ReceiptItemDto[] = []
			receipt.receiptItems.forEach((item) => {
				const product = productList.find((i) => i.otherId === item.productOtherId)
				if (!product) {
					console.log('🚀 ~ receiptData: product undefined ~ item.productOtherId:', item.productOtherId)
					throw new Error('---- Product undefined ----')
				}
				const productUnit = JSON.parse(product.unit) as { name: string, rate: number }[]
				const unit = JSON.stringify(productUnit.find((i) => i.rate === 1))

				const productBatch = product.productBatches.find((i) => {
					return i.expiryDate == item.expiryDate
						&& i.costPrice === item.cost * 1000
				})
				if (!productBatch) {
					console.log('🚀 ~ receiptData: productBatch undefined ~ productId', product.id)
					throw new Error('---- Product undefined ----')
				}
				receiptItemsDto.push({
					productBatchId: productBatch.id,
					unit,
					quantity: item.quantity,
					productBatch,
				})
			})

			const distributor = distributorList.find((i) => i.otherId === receipt.distributorOtherId)
			if (!distributor) {
				console.log('🚀 ~ receiptData: distributor undefined ~ receipt.distributorOtherId:', receipt.distributorOtherId)
				throw new Error('---- Product undefined ----')
			}
			const receiptInsertDto: ReceiptInsertDto = {
				distributorId: distributor.id,
				totalItemMoney: Number(receipt.totalMoney) * 1000,
				discountMoney: 0,
				discountPercent: 0,
				discountType: DiscountType.VND,
				surcharge: 0,
				totalMoney: Number(receipt.totalMoney) * 1000,
				debt: 0,
				receiptItems: receiptItemsDto,
			}

			const createTime = textToTime(`20${receipt.otherId}`, 'YYYY-MM-DD-hh-mm-ss').getTime()

			itemsAction.push({
				type: 'RECEIPT',
				createTime,
				receiptInsertDto,
			})
		}

		// thêm tất cả đơn hàng
		for (let i = invoiceData.length - 1; i >= 0; i--) {
			const invoice = invoiceData[i]

			const invoiceItemsDto: InvoiceItemDto[] = []
			invoice.invoiceItems.forEach((item) => {
				const product = productList.find((i) => i.otherId === item.productOtherId)
				if (!product) {
					console.log('🚀 ~ invoiceData: product undefined ~ item.productOtherId:', item.productOtherId)
					throw new Error('---- Product undefined ----')
				}

				const productUnit = JSON.parse(product.unit) as { name: string, rate: number }[]
				const unit = JSON.stringify(productUnit.find((i) => i.rate === 1))
				const productBatch = product.productBatches.find((i) => {
					return i.expiryDate == item.expiryDate
						&& i.costPrice === item.costPrice * 1000
				})
				if (!productBatch) {
					console.log('🚀 ~ invoiceData: productBatch undefined ~ productId', product.id)
					throw new Error('---- Product undefined ----')
				}

				const expectedPrice = Number(item.expectedPrice) * 1000
				const discountMoney = item.discountMoney * 1000
				invoiceItemsDto.push({
					referenceId: productBatch.id,
					type: InvoiceItemType.ProductBatch,
					unit,
					costPrice: productBatch.costPrice,
					expectedPrice,
					quantity: item.quantity,
					actualPrice: item.actualPrice * 1000,
					discountMoney,
					discountPercent: Math.ceil(discountMoney * 100 / expectedPrice),
					discountType: DiscountType.VND,
				})
			})

			const invoiceUpsertDto: InvoiceUpsertDto = {
				invoiceItems: invoiceItemsDto,
				totalCostMoney: invoice.totalCostMoney * 1000,
				totalItemMoney: invoice.totalItemMoney * 1000,
				discountMoney: 0,
				discountPercent: 0,
				discountType: DiscountType.VND,
				surcharge: invoice.surcharge * 1000,
				expenses: invoice.expenses * 1000,
				totalMoney: invoice.totalMoney * 1000,
				profit: invoice.profit * 1000,
				debt: invoice.debt * 1000,
				note: invoice.note,
			}

			const customer = customerList.find((i) => i.otherId === invoice.customerOtherId)
			if (!customer) {
				console.log('🚀 ~ receiptData: customer undefined ~ receipt.customerOtherId:', invoice.customerOtherId)
				throw new Error('---- Product undefined ----')
			}
			const createTime = textToTime(`20${invoice.otherId}`, 'YYYY-MM-DD-hh-mm-ss').getTime()

			itemsAction.push({
				type: 'INVOICE',
				customerId: customer.id,
				createTime,
				invoiceUpsertDto,
				status: invoice.status,
			})
		}

		// sắp xếp theo thời gian để xử lý lần lượt => mục đích tạo lịch sử chuẩn
		itemsAction.sort((a, b) => {
			if (a.createTime > b.createTime) return 1
			if (a.createTime < b.createTime) return -1
			return 0
		})
		for (let i = 0; i < itemsAction.length; i++) {
			const target = itemsAction[i]
			if (target.type === 'INVOICE') {
				const { invoiceId, arrivalId } = await this.arrivalInvoiceRepository.createInvoiceDraft({
					oid,
					time: target.createTime,
					customerId: target.customerId,
					invoiceUpsertDto: target.invoiceUpsertDto,
				})
				if (target.status === 'Success') {
					await this.arrivalInvoiceRepository.paymentInvoiceDraft({ oid, invoiceId, time: target.createTime })
				}
			}
			if (target.type === 'RECEIPT') {
				const { receiptId, purchaseId } = await this.purchaseReceiptRepository.createReceiptDraft(oid, target.receiptInsertDto, target.createTime)
				await this.purchaseReceiptRepository.paymentReceiptDraft(oid, receiptId, target.createTime)
			}
		}
	}

	// async seedAllReceipt(oid: number) {
	// 	const productList = await this.manager.find(Product, {
	// 		where: { oid },
	// 		relations: { productBatches: true },
	// 	})
	// 	const distributorList = await this.manager.find(Distributor, { where: { oid } })
	// 	for (let i = receiptData.length - 1; i >= 0; i--) { // vì đang lưu mảng ngược
	// 		const receipt = receiptData[i]

	// 		const receiptItemsDto: ReceiptItemDto[] = []
	// 		receipt.receiptItems.forEach((item) => {
	// 			const product = productList.find((i) => i.otherId === item.productOtherId)
	// 			if (!product) {
	// 				console.log('🚀 ~ receiptData: product undefined ~ item.productOtherId:', item.productOtherId)
	// 				throw new Error('---- Product undefined ----')
	// 			}
	// 			const productBatch = product.productBatches.find((i) => {
	// 				return i.expiryDate == item.expiryDate
	// 					&& i.costPrice === item.cost * 1000
	// 			})
	// 			if (!productBatch) {
	// 				console.log('🚀 ~ receiptData: productBatch undefined ~ productId', product.id)
	// 				throw new Error('---- Product undefined ----')
	// 			}
	// 			receiptItemsDto.push({
	// 				productBatchId: productBatch.id,
	// 				quantity: item.quantity,
	// 				productBatch,
	// 			})
	// 		})

	// 		const distributor = distributorList.find((i) => i.otherId === receipt.distributorOtherId)
	// 		if (!distributor) {
	// 			console.log('🚀 ~ receiptData: distributor undefined ~ receipt.distributorOtherId:', receipt.distributorOtherId)
	// 			throw new Error('---- Product undefined ----')
	// 		}
	// 		const receiptInsertDto: ReceiptInsertDto = {
	// 			distributorId: distributor.id,
	// 			totalItemMoney: Number(receipt.totalMoney) * 1000,
	// 			discountMoney: 0,
	// 			discountPercent: 0,
	// 			discountType: DiscountType.VND,
	// 			surcharge: 0,
	// 			totalMoney: Number(receipt.totalMoney) * 1000,
	// 			debt: 0,
	// 			receiptItems: receiptItemsDto,
	// 		}

	// 		const createTime = textToTime(`20${receipt.otherId}`, 'YYYY-MM-DD-hh-mm-ss').getTime()
	// 		const paymentTime = createTime
	// 		const { receiptId, purchaseId } = await this.purchaseReceiptRepository.createReceiptDraft(oid, receiptInsertDto, createTime)
	// 		await this.purchaseReceiptRepository.paymentReceiptDraft(oid, receiptId, paymentTime)
	// 	}
	// }

	// 	payDebtHistory.sort((a, b) => {
	// 		if (a.createTime > b.createTime) return 1
	// 		if (a.createTime < b.createTime) return -1
	// 		return 0
	// 	})
	// 	for (let i = 0; i < payDebtHistory.length; i++) {
	// 		await this.customerDebtRepository.startPayDebt(payDebtHistory[i])
	// 	}
	// }

	// async seedAllInvoice(oid: number) {
	// 	const productList = await this.manager.find(Product, {
	// 		where: { oid },
	// 		relations: { productBatches: true },
	// 	})
	// 	const customerList = await this.manager.find(Customer, { where: { oid } })

	// 	for (let i = invoiceData.length - 1; i >= 0; i--) {
	// 		const invoice = invoiceData[i]

	// 		const invoiceItemsDto: InvoiceItemDto[] = []
	// 		invoice.invoiceItems.forEach((item) => {
	// 			const product = productList.find((i) => i.otherId === item.productOtherId)
	// 			if (!product) {
	// 				console.log('🚀 ~ invoiceData: product undefined ~ item.productOtherId:', item.productOtherId)
	// 				throw new Error('---- Product undefined ----')
	// 			}
	// 			const productBatch = product.productBatches.find((i) => {
	// 				return i.expiryDate == item.expiryDate
	// 					&& i.costPrice === item.costPrice * 1000
	// 			})
	// 			if (!productBatch) {
	// 				console.log('🚀 ~ invoiceData: productBatch undefined ~ productId', product.id)
	// 				throw new Error('---- Product undefined ----')
	// 			}

	// 			const expectedPrice = Number(item.expectedPrice) * 1000
	// 			const discountMoney = item.discountMoney * 1000
	// 			invoiceItemsDto.push({
	// 				referenceId: productBatch.id,
	// 				type: InvoiceItemType.ProductBatch,
	// 				costPrice: productBatch.costPrice,
	// 				expectedPrice,
	// 				quantity: item.quantity,
	// 				actualPrice: item.actualPrice * 1000,
	// 				discountMoney,
	// 				discountPercent: Math.ceil(discountMoney * 100 / expectedPrice),
	// 				discountType: DiscountType.VND,
	// 			})
	// 		})

	// 		const customer = customerList.find((i) => i.otherId === invoice.customerOtherId)
	// 		if (!customer) {
	// 			console.log('🚀 ~ receiptData: customer undefined ~ receipt.customerOtherId:', invoice.customerOtherId)
	// 			throw new Error('---- Product undefined ----')
	// 		}
	// 		const invoiceUpsertDto: InvoiceUpsertDto = {
	// 			invoiceItems: invoiceItemsDto,
	// 			customerId: customer.id,
	// 			totalCostMoney: invoice.totalCostMoney * 1000,
	// 			totalItemMoney: invoice.totalItemMoney * 1000,
	// 			discountMoney: 0,
	// 			discountPercent: 0,
	// 			discountType: DiscountType.VND,
	// 			surcharge: invoice.surcharge * 1000,
	// 			expenses: invoice.expenses * 1000,
	// 			totalMoney: invoice.totalMoney * 1000,
	// 			profit: invoice.profit * 1000,
	// 			debt: invoice.debt * 1000,
	// 			note: invoice.note,
	// 		}

	// 		const createTime = textToTime(`20${invoice.otherId}`, 'YYYY-MM-DD-hh-mm-ss').getTime()
	// 		const paymentTime = createTime
	// 		const { invoiceId, arrivalId } = await this.arrivalInvoiceRepository.createInvoiceDraft(oid, invoiceUpsertDto, createTime)
	// 		if (invoice.status === 'Success') {
	// 			await this.arrivalInvoiceRepository.paymentInvoiceDraft(oid, invoiceId, paymentTime)
	// 		}
	// 	}
	// }
}
