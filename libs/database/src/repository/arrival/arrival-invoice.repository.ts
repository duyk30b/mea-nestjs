import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { uniqueArray } from '_libs/common/helpers/object.helper'
import { ArrivalType, DebtType, InvoiceItemType, PaymentStatus, ProductMovementType } from '_libs/database/common/variable'
import { Arrival, Customer, CustomerDebt, Invoice, InvoiceItem, ProductBatch, ProductMovement } from '_libs/database/entities'
import { DataSource, EntityManager, In } from 'typeorm'
import { InvoiceUpsertDto } from './arrival-invoice.dto'

@Injectable()
export class ArrivalInvoiceRepository {
	constructor(
		private dataSource: DataSource,
		@InjectEntityManager() private manager: EntityManager
	) { }

	async createInvoiceDraft(options: { oid: number, customerId: number, invoiceUpsertDto: InvoiceUpsertDto, time?: number }) {
		const { oid, customerId, invoiceUpsertDto } = options
		const time = options.time || Date.now()

		return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
			const arrivalSnap = manager.create<Arrival>(Arrival, {
				oid,
				customerId,
				type: ArrivalType.Invoice,
				paymentStatus: PaymentStatus.Unpaid,
				createTime: time,
				totalMoney: invoiceUpsertDto.totalMoney,
				profit: invoiceUpsertDto.profit,
				debt: invoiceUpsertDto.debt,
			})
			const arrivalInsertResult = await manager.insert(Arrival, arrivalSnap)
			const arrivalId = arrivalInsertResult.identifiers?.[0]?.id
			if (!arrivalId) {
				throw new Error(`Create Arrival failed: Insert error ${JSON.stringify(arrivalInsertResult)}`)
			}

			const invoiceSnap = manager.create<Invoice>(Invoice, invoiceUpsertDto)
			invoiceSnap.oid = oid
			invoiceSnap.customerId = customerId
			invoiceSnap.arrivalId = arrivalId
			invoiceSnap.paymentStatus = PaymentStatus.Unpaid
			const invoiceInsertResult = await manager.insert(Invoice, invoiceSnap)
			const invoiceId = invoiceInsertResult.identifiers?.[0]?.id
			if (!invoiceId) {
				throw new Error(`Create Invoice failed: Insert error ${JSON.stringify(invoiceInsertResult)}`)
			}

			const invoiceItemsSnap = manager.create<InvoiceItem>(InvoiceItem, invoiceUpsertDto.invoiceItems)
			invoiceItemsSnap.forEach((item) => {
				item.oid = oid
				item.invoiceId = invoiceId
				item.customerId = customerId
			})
			await manager.insert(InvoiceItem, invoiceItemsSnap)

			return { arrivalId, invoiceId }
		})
	}

	async updateInvoiceDraft(options: { oid: number, invoiceId: number, invoiceUpsertDto: InvoiceUpsertDto }) {
		const { oid, invoiceId, invoiceUpsertDto } = options

		return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
			const { invoiceItems, ...invoiceSnap } = manager.create<Invoice>(Invoice, invoiceUpsertDto)
			const invoiceUpdateResult = await manager.update(Invoice, {
				id: invoiceId,
				oid,
				paymentStatus: PaymentStatus.Unpaid,
			}, invoiceSnap)
			if (invoiceUpdateResult.affected !== 1) {
				throw new Error(`Update Invoice ${invoiceId} failed: Status invalid`)
			}

			const [invoice] = await manager.find(Invoice, { where: { id: invoiceId, oid } })
			const { arrivalId } = invoice
			const arrivalUpdateResult = await manager.update(Arrival, {
				oid,
				id: arrivalId,
				type: ArrivalType.Invoice,
				paymentStatus: PaymentStatus.Unpaid,
			}, {
				totalMoney: invoiceUpsertDto.totalMoney,
				profit: invoiceUpsertDto.profit,
				debt: invoiceUpsertDto.debt,
			})
			if (arrivalUpdateResult.affected !== 1) {
				throw new Error(`Update Arrival ${arrivalId} failed: Status invalid`)
			}

			const deleteInvoiceItem = await manager.delete(InvoiceItem, { oid, invoiceId })

			const invoiceItemsSnap = manager.create<InvoiceItem>(InvoiceItem, invoiceUpsertDto.invoiceItems)
			invoiceItemsSnap.forEach((item) => {
				item.oid = oid
				item.invoiceId = invoiceId
				item.customerId = invoice.customerId
			})
			await manager.insert(InvoiceItem, invoiceItemsSnap)

			return { arrivalId, invoiceId }
		})
	}

	async createInvoiceDraftAfterRefund(options: { oid: number, arrivalId: number, invoiceUpsertDto: InvoiceUpsertDto }) {
		const { oid, arrivalId, invoiceUpsertDto } = options

		return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
			const arrivalUpdateResult = await manager.update(Arrival, {
				oid,
				id: arrivalId,
				type: ArrivalType.Invoice,
				paymentStatus: PaymentStatus.Refund,
			}, {
				totalMoney: invoiceUpsertDto.totalMoney,
				profit: invoiceUpsertDto.profit,
				debt: invoiceUpsertDto.debt,
				paymentStatus: PaymentStatus.Unpaid,
			})
			if (arrivalUpdateResult.affected !== 1) {
				throw new Error(`Create Invoice for Arrival ${arrivalId} failed: Status invalid`)
			}
			const arrival = await manager.findOne(Arrival, { where: { id: arrivalId } })

			const invoiceSnap = manager.create<Invoice>(Invoice, invoiceUpsertDto)
			invoiceSnap.oid = oid
			invoiceSnap.arrivalId = arrivalId
			invoiceSnap.customerId = arrival.customerId
			invoiceSnap.paymentStatus = PaymentStatus.Unpaid
			const invoiceInsertResult = await manager.insert(Invoice, invoiceSnap)
			const invoiceId = invoiceInsertResult.identifiers?.[0]?.id
			if (!invoiceId) {
				throw new Error(`Create Invoice for Arrival ${arrivalId} failed: Insert error ${JSON.stringify(invoiceInsertResult)}`)
			}
			const invoiceItemsSnap = manager.create<InvoiceItem>(InvoiceItem, invoiceUpsertDto.invoiceItems)
			invoiceItemsSnap.forEach((item) => {
				item.oid = oid
				item.invoiceId = invoiceId
				item.customerId = arrival.customerId
			})
			await manager.insert(InvoiceItem, invoiceItemsSnap)

			return { arrivalId, invoiceId }
		})
	}

	async paymentInvoiceDraft(options: { oid: number, invoiceId: number, time?: number }) {
		const { oid, invoiceId } = options
		const time = options.time || Date.now()

		return await this.dataSource.transaction(async (manager) => {
			const invoiceUpdateResult = await manager.update(Invoice, {
				id: invoiceId,
				oid,
				paymentStatus: PaymentStatus.Unpaid,
			}, {
				paymentStatus: PaymentStatus.Full,
				paymentTime: time,
			})
			if (invoiceUpdateResult.affected !== 1) {
				throw new Error(`Payment Invoice ${invoiceId} failed: Status invalid`)
			}

			const [invoice] = await manager.find(Invoice, {
				relations: { invoiceItems: true },
				relationLoadStrategy: 'join',
				where: { oid, id: invoiceId },
			})
			if (invoice.invoiceItems.length === 0) {
				throw new Error(`Payment Invoice ${invoiceId} failed: invoiceItems.length = 0`)
			}
			const { arrivalId } = invoice

			const updateArrival = await manager.update(Arrival, { id: arrivalId, type: ArrivalType.Invoice }, {
				totalMoney: invoice.totalMoney,
				profit: invoice.profit,
				debt: invoice.debt,
				paymentStatus: PaymentStatus.Full,
			})
			if (updateArrival.affected !== 1) {
				throw new Error(`Payment Invoice ${invoiceId} failed: Arrival ${arrivalId} invalid`)
			}

			const invoiceItemsProduct = invoice.invoiceItems.filter((i) => i.type === InvoiceItemType.ProductBatch)

			// Trừ số lượng của lô hàng
			if (invoiceItemsProduct.length) {
				const productBatchIds = uniqueArray(invoiceItemsProduct.map((i: InvoiceItem) => i.referenceId))
				// update trước để lock các bản ghi của productBatch
				const updateBatch = await manager.query(`
					UPDATE product_batch 
						LEFT JOIN ( SELECT reference_id, SUM(quantity) as sum_quantity 
							FROM invoice_item
							WHERE invoice_item.invoice_id = ${invoice.id} AND invoice_item.oid = ${oid}
							GROUP BY reference_id
						) invoice_item 
						ON product_batch.id = invoice_item.reference_id
					SET product_batch.quantity = product_batch.quantity - invoice_item.sum_quantity
					WHERE product_batch.id IN (${productBatchIds.toString()})
						AND product_batch.oid = ${oid}
				`)
				if (updateBatch.affectedRows !== productBatchIds.length) {
					throw new Error(`Payment Invoice ${invoiceId} failed: Some batch can't update quantity`)
				}

				const productBatches = await manager.find(ProductBatch, { where: { id: In(productBatchIds) } })

				const productMovementsSnap = invoiceItemsProduct.map((invoiceItem) => {
					const productBatch = productBatches.find((i) => i.id === invoiceItem.referenceId)
					if (!productBatch) {
						throw new Error(`Payment Invoice ${invoiceId} failed: ProductBatchID ${invoiceItem.referenceId} invalid`)
					}
					// cần cập nhật số lượng vì 1 lô có thể bán 2 số lượng với 2 giá khác nhau
					productBatch.quantity = productBatch.quantity + invoiceItem.quantity // trả lại số lượng ban đầu vì ở trên đã bị update trước

					return manager.create(ProductMovement, {
						oid,
						productId: productBatch.productId,
						productBatchId: productBatch.id,
						referenceId: invoiceId,
						createTime: time,
						type: ProductMovementType.Invoice,
						isRefund: false,
						openQuantity: productBatch.quantity, // quantity bị cập nhật ở trên rồi
						number: -invoiceItem.quantity,
						closeQuantity: productBatch.quantity - invoiceItem.quantity,
						price: invoiceItem.actualPrice,
						totalMoney: invoiceItem.quantity * invoiceItem.actualPrice,
					})
				})
				await manager.insert(ProductMovement, productMovementsSnap)
			}

			// Ghi nợ nếu có
			if (invoice.debt) {
				const updateCustomer = await manager.increment<Customer>(
					Customer,
					{ id: invoice.customerId },
					'debt',
					invoice.debt
				)
				if (updateCustomer.affected !== 1) {
					throw new Error(`Payment Invoice ${invoiceId} failed: Update customer ${invoice.customerId} invalid`)
				}

				const customer = await manager.findOne(Customer, {
					where: { oid, id: invoice.customerId },
					select: { debt: true },
				})

				const customerDebtDto = manager.create<CustomerDebt>(CustomerDebt, {
					oid,
					customerId: invoice.customerId,
					invoiceId,
					type: DebtType.Borrow,
					createTime: time,
					openDebt: customer.debt - invoice.debt, // trả lại số lượng ban đầu bị bị update ở trên
					money: invoice.debt,
					closeDebt: customer.debt,
				})
				await manager.save(customerDebtDto)
			}
			return { arrivalId, invoiceId }
		})
	}

	async createInvoicePaid(options: { oid: number, customerId: number, invoiceUpsertDto: InvoiceUpsertDto, time?: number }) {
		const { invoiceId } = await this.createInvoiceDraft(options)
		const invoice = await this.paymentInvoiceDraft({ oid: options.oid, invoiceId, time: options.time })
		return invoice
	}

	async refundInvoice(options: { oid: number, invoiceId: number, time?: number }) {
		const { oid, invoiceId } = options
		const time = options.time || Date.now()

		return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
			const invoiceUpdateResult = await manager.update(Invoice, {
				id: invoiceId,
				oid,
				paymentStatus: PaymentStatus.Full,
			}, {
				paymentStatus: PaymentStatus.Refund,
				refundTime: time,
			})
			if (invoiceUpdateResult.affected !== 1) {
				throw new Error(`Refund Invoice ${invoiceId} failed: Invoice ${invoiceId} invalid`)
			}

			const [invoice] = await manager.find(Invoice, {
				relations: { invoiceItems: true },
				relationLoadStrategy: 'join',
				where: { oid, id: invoiceId },
			})
			if (invoice.invoiceItems.length === 0) {
				throw new Error(`Refund Invoice ${invoiceId} failed: invoiceItems.length = 0 `)
			}
			const { arrivalId } = invoice

			const updateArrival = await manager.update(Arrival, { oid, id: arrivalId, type: ArrivalType.Invoice }, {
				totalMoney: invoice.totalMoney,
				profit: invoice.profit,
				debt: invoice.debt,
				createTime: time,
				paymentStatus: PaymentStatus.Refund,
			})
			if (updateArrival.affected !== 1) {
				throw new Error(`Refund Invoice ${invoiceId} failed: Arrival ${arrivalId} invalid`)
			}

			const invoiceItemsProduct = invoice.invoiceItems.filter((i) => i.type === InvoiceItemType.ProductBatch)
			if (invoiceItemsProduct.length) {
				const productBatchIds = uniqueArray(invoiceItemsProduct.map((i: InvoiceItem) => i.referenceId))
				// update trước để lock các bản ghi của productBatch
				const updateBatch = await manager.query(`
					UPDATE product_batch 
						LEFT JOIN ( SELECT reference_id, SUM(quantity) as sum_quantity
							FROM invoice_item
							WHERE invoice_item.invoice_id = ${invoice.id} AND invoice_item.oid = ${oid}
							GROUP BY reference_id
						) invoice_item 
						ON product_batch.id = invoice_item.reference_id
					SET product_batch.quantity = product_batch.quantity + invoice_item.sum_quantity
					WHERE product_batch.id IN (${productBatchIds.toString()})
						AND product_batch.oid = ${oid}
				`)
				if (updateBatch.affectedRows !== productBatchIds.length) {
					throw new Error(`Refund Invoice ${invoiceId} failed: Some batch can't update quantity`)
				}

				const productBatches = await manager.findBy(ProductBatch, { id: In(productBatchIds) })
				const productMovementsSnap = invoiceItemsProduct.map((invoiceItem) => {
					const productBatch = productBatches.find((i) => i.id === invoiceItem.referenceId)
					if (!productBatch) {
						throw new Error(`Refund Invoice ${invoiceId} failed: ProductBatchID ${invoiceItem.referenceId} invalid`)
					}
					// cần cập nhật số lượng vì 1 lô có thể bán 2 số lượng với 2 giá khác nhau
					productBatch.quantity = productBatch.quantity - invoiceItem.quantity // trả lại số lượng ban đầu vì ở trên đã bị update trước

					return manager.create(ProductMovement, {
						oid,
						productId: productBatch.productId,
						productBatchId: productBatch.id,
						referenceId: invoiceId,
						createTime: time,
						type: ProductMovementType.Invoice,
						isRefund: true,
						openQuantity: productBatch.quantity,
						number: invoiceItem.quantity,
						closeQuantity: productBatch.quantity + invoiceItem.quantity,
						price: invoiceItem.actualPrice,
						totalMoney: (-invoiceItem.quantity) * invoiceItem.actualPrice,
					})
				})
				await manager.insert(ProductMovement, productMovementsSnap)
			}

			// Ghi nợ nếu có
			if (invoice.debt) {
				// update trước để tạo lock cho customer
				const updateCustomer = await manager.decrement<Customer>(
					Customer,
					{ id: invoice.customerId },
					'debt',
					invoice.debt
				)
				if (updateCustomer.affected !== 1) {
					throw new Error(`Payment Invoice ${invoiceId} failed: Update customer ${invoice.customerId} invalid`)
				}

				const customer = await manager.findOne(Customer, {
					where: { oid, id: invoice.customerId },
					select: { debt: true },
				})

				const customerDebtDto = manager.create<CustomerDebt>(CustomerDebt, {
					oid,
					customerId: invoice.customerId,
					invoiceId,
					type: DebtType.Refund,
					createTime: time,
					openDebt: customer.debt + invoice.debt,  // Trả lại số lượng ban đầu vì đã bị update trước đó
					money: -invoice.debt,
					closeDebt: customer.debt,
				})
				await manager.insert(CustomerDebt, customerDebtDto)
			}

			return { arrivalId, invoiceId }
		})
	}

	// async recalculateProductQuantity(oid: number, productDeliveryId: number) {
	// 	await this.dataSource.manager.query(`
	// 		UPDATE product 
	// 			LEFT JOIN ( SELECT product_id, SUM(quantity) as quantity FROM product_batch GROUP BY product_id ) sa 
	// 			ON product.id = sa.product_id
	// 		SET product.quantity = sa.quantity
	// 		WHERE product.id IN (SELECT DISTINCT product_id FROM \`product_delivery\` WHERE id = ${productDeliveryId}) 
	// 			AND product.oid = ${oid}
	// 	`)
	// }
}
