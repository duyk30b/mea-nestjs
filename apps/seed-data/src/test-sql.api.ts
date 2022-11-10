import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { sleep } from '_libs/common/helpers/function.helper'
import { randomFullName } from '_libs/common/helpers/random.helper'
import { InvoiceItemType, PaymentStatus } from '_libs/database/common/variable'
import { Arrival, Customer, Distributor, Invoice, InvoiceItem, Purchase, Receipt } from '_libs/database/entities'
import { DataSource, EntityManager, Repository } from 'typeorm'

@ApiTags('Test')
@ApiBearerAuth('access-token')
@Controller('test')
export class TestApi {
	constructor(
		private dataSource: DataSource,
		@InjectEntityManager() private manager: EntityManager,
		@InjectRepository(Arrival) private arrivalRepository: Repository<Arrival>
	) { }

	@Get('update_query_join')
	async update_query_join() {
		const result = await this.manager.query(`
			UPDATE product_movement LEFT JOIN product_batch
				ON product_movement.product_batch_id = product_batch.id
			SET product_movement.open_quantity = product_batch.quantity,
				product_movement.close_quantity = product_batch.quantity + product_movement.number,
				product_batch.quantity = product_batch.quantity + product_movement.number
			WHERE product_movement.reference_id = 1 AND product_batch.oid = 1
		`)
		// result = {
		// 	fieldCount: 0,
		// 	affectedRows: 26,
		// 	insertId: 0,
		// 	info: 'Rows matched: 26  Changed: 26  Warnings: 0',
		// 	serverStatus: 34,
		// 	warningStatus: 0,
		// 	changedRows: 26,
		// }
		return result
	}

	@Get('insert')
	async insert() {
		const purchaseEntity = this.manager.create<Purchase>(Purchase, [
			{
				oid: 1,
				distributorId: 12,
				paymentStatus: PaymentStatus.Unpaid,
				createTime: 12313,
				totalMoney: 123,
				debt: 123123,
			},
		])
		const result = await this.manager.insert(Purchase, purchaseEntity)
		// result = {
		// 	identifiers: [{ id: 6 }],
		// 	generatedMaps: [
		// 		{
		// 			id: 6,
		// 			paymentStatus: 1,
		// 			totalMoney: '123',
		// 			debt: 123123,
		// 		},
		// 	],
		// 	raw: [
		// 		{
		// 			id: 6,
		// 			payment_status: 1,
		// 			total_money: '123',
		// 			debt: 123123,
		// 		},
		// 	],
		// }
		return result
	}

	@Get('query-builder')
	async queryBuilder() {
		// const result = await this.manager.createQueryBuilder('arrival', 'arrival')
		// 	.leftJoinAndSelect('arrival.customer', 'customer', 'arrival.customer_id = customer.id')
		// 	.where('arrival.id = :arrivalId', { arrivalId: 1 })
		// 	.getOne()

		// relations với 1 bảng không quy định trong entity phải dùng Raw
		// const result = await this.arrivalRepository
		// 	.createQueryBuilder('arrival')
		// 	.leftJoinAndSelect('distributor', 'distributor', 'arrival.customer_id = distributor.id')
		// 	.select(['arrival.id as id', 'distributor.full_name_vi as fullNameVi'])
		// 	.where('arrival.id = :arrivalId', { arrivalId: 1 })
		// 	.getRawOne()

		const result = await this.manager.createQueryBuilder(Arrival, 'arrival')
			.leftJoinAndSelect('arrival.customer', 'customer')
			.leftJoinAndSelect('arrival.invoices', 'invoice')
			.leftJoinAndSelect('invoice.invoiceItems', 'invoiceItem')
			.leftJoinAndSelect(
				'invoiceItem.procedure',
				'procedure',
				'invoiceItem.type = :typeProcedure',
				{ typeProcedure: InvoiceItemType.Procedure }
			)
			.leftJoinAndSelect(
				'invoiceItem.productBatch',
				'productBatch',
				'invoiceItem.type = :typeProductBatch',
				{ typeProductBatch: InvoiceItemType.ProductBatch }
			)
			.where('arrival.id = :id', { id: 1 })
			.getOne()

		console.log('🚀 ~ file: test.api.ts:81 ~ TestApi ~ queryBuilder ~ result:', result)
		return result
	}

	@Get('transaction_READ_UNCOMMITTED')
	async transaction_READ_UNCOMMITTED() {
		const startTime = Date.now()
		const [customerRoot] = await this.manager.find(Customer, { where: { id: 1 } })
		const result = await Promise.allSettled([
			this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
				await sleep(1000)
				await manager.update(Customer, { id: 1, fullNameVi: '444' }, { fullNameVi: '666' })
				await sleep(3000)
			}),
			this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
				await manager.update(Customer, { id: 1 }, { fullNameVi: '555' })
				await sleep(2000)
			}),
		])
		const endTime = Date.now()
		const [customerAfter] = await this.manager.find(Customer, { where: { id: 1 } })
		return {
			customerRoot: customerRoot.fullNameVi,
			result,
			customerAfter: customerAfter.fullNameVi,
			time: endTime - startTime,
		}
	}

	@Get('transaction_REPEATABLE_READ')
	async transaction_REPEATABLE_READ() {
		const [receiptRoot] = await this.manager.find(Receipt, { where: { id: 1 } })
		const startTime = Date.now()
		const result = await Promise.allSettled([
			this.dataSource.transaction('REPEATABLE READ', async (manager) => {
				await sleep(1000)
				// await manager.update(Receipt, { id: 1 }, { note: randomFullName() })
				await manager.update(Distributor, { id: 156 }, { fullNameVi: randomFullName() })
				await sleep(3000)
			}),
			this.dataSource.transaction('SERIALIZABLE', async (manager) => {
				const [receipt] = await manager.find(Receipt, {
					where: { id: 1, oid: 1 },
					relations: { receiptItems: true, distributor: true },
					relationLoadStrategy: 'join',
				})
				await sleep(2000)
				return receipt.note
			}),
		])
		const endTime = Date.now()
		const [receiptAfter] = await this.manager.find(Receipt, { where: { id: 1 } })
		return {
			receiptRoot: receiptRoot.note,
			result,
			receiptAfter: receiptAfter.note,
			time: endTime - startTime,
		}
	}

	@Get('transaction_SERIALIZABLE')
	async transaction_SERIALIZABLE() {
		const startTime = Date.now()
		const [customerRoot] = await this.manager.find(Customer, { where: { id: 1 } })
		const result = await Promise.allSettled([
			this.dataSource.transaction('SERIALIZABLE', async (manager) => {
				await sleep(1000)
				await manager.update(Customer, { id: 1 }, { fullNameVi: randomFullName() })
				await sleep(3000)
			}),
			this.dataSource.transaction('SERIALIZABLE', async (manager) => {
				const [customer] = await manager.find(Customer, { where: { id: 1 } })
				await sleep(2000)
				return customer.fullNameVi
			}),
		])
		const endTime = Date.now()
		const [customerAfter] = await this.manager.find(Customer, { where: { id: 1 } })
		return {
			customerRoot: customerRoot.fullNameVi,
			result,
			customerAfter: customerAfter.fullNameVi,
			time: endTime - startTime,
		}
	}

	@Get('query-transaction')
	// 1. Transaction không block hàm find, find hoạt động bình thường
	async query_transaction() {
		const [customerRoot] = await this.manager.find(Customer, { where: { id: 1 } })
		const startTime = Date.now()
		const result = await Promise.allSettled([
			this.dataSource.transaction('SERIALIZABLE', async (manager) => {
				// await sleep(1000) 
				manager.find(Customer, { where: { id: 1 } })
				// manager.update(Customer, { id: 1 }, { fullNameVi: randomFullName() })
				await sleep(3000)
				// throw new Error('some error')
			}),
			(async () => {
				await sleep(2000)
				await this.manager.update(Customer, { id: 1 }, { fullNameVi: new Date().toISOString() })
				await sleep(1000)
			})(),
			// (async () => {
			// 	await sleep(1000)
			// 	const [customer] = await this.manager.find(Customer, { where: { id: 1 } })
			// 	await sleep(1000)
			// 	return customer.fullNameVi
			// })(),
			// (async () => {
			// 	await sleep(5000) // cái này thì luôn đúng vì sleep 5s, thằng transaction thực hiện xong rôi
			// 	const [customer] = await this.manager.find(Customer, { where: { id: 1 } })
			// 	await sleep(1000)
			// 	return customer.fullNameVi
			// })(),
		])
		const endTime = Date.now()
		const [customerAfter] = await this.manager.find(Customer, { where: { id: 1 } })

		return {
			customerRoot: customerRoot.fullNameVi,
			result,
			customerAfter: customerAfter.fullNameVi,
			time: endTime - startTime,
		}
	}

	@Get('transaction-DEADLOCK')
	async transaction_DEADLOCK() {
		const result = await Promise.allSettled([
			this.dataSource.transaction('SERIALIZABLE', async (manager) => {
				const [customer] = await manager.find(Customer, { where: { id: 1 } })
				await sleep(2000)
				await manager.update(Customer, { id: 1 }, { fullNameVi: randomFullName() })
			}),
			this.dataSource.transaction('SERIALIZABLE', async (manager) => {
				const [customer] = await manager.find(Customer, { where: { id: 1 } })
				await sleep(2000)
				await manager.update(Customer, { id: 1 }, { fullNameVi: randomFullName() })
			}),
		])
		return { result }
	}

	@Get('transaction-DEADLOCK_READ_UNCOMMITTED')
	async transaction_DEADLOCK_READ_UNCOMMITTED() {
		const result = await Promise.allSettled([
			this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
				await manager.update(Customer, { id: 1 }, { fullNameVi: randomFullName() })
				await sleep(2000)
				await manager.update(Customer, { id: 2 }, { fullNameVi: randomFullName() })
			}),
			this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
				await manager.update(Customer, { id: 2 }, { fullNameVi: randomFullName() })
				await sleep(2000)
				await manager.update(Customer, { id: 1 }, { fullNameVi: randomFullName() })
			}),
		])
		return { result }
	}
}
