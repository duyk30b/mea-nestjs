import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { uniqueArray } from '_libs/common/helpers/object.helper'
import { DebtType, InvoiceItemType, InvoiceStatus, ProductMovementType } from '_libs/database/common/variable'
import { Customer, CustomerDebt, Invoice, InvoiceItem, ProductBatch, ProductMovement } from '_libs/database/entities'
import { DataSource, EntityManager, In, IsNull } from 'typeorm'
import { ProductRepository } from '../product/product.repository'
import { InvoiceInsertDto, InvoiceUpdateDto } from './invoice.dto'

@Injectable()
export class InvoiceQuickRepository {
	constructor(
		private dataSource: DataSource,
		@InjectEntityManager() private manager: EntityManager,
		private productRepository: ProductRepository
	) { }

	async createDraft(params: { oid: number, invoiceInsertDto: InvoiceInsertDto, }) {
		const { oid, invoiceInsertDto } = params

		return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
			const { invoiceItems, ...invoiceSnap } = manager.create<Invoice>(Invoice, invoiceInsertDto)
			invoiceSnap.oid = oid
			invoiceSnap.status = InvoiceStatus.Draft

			const invoiceInsertResult = await manager.insert(Invoice, invoiceSnap)
			const invoiceId: number = invoiceInsertResult.identifiers?.[0]?.id
			if (!invoiceId) {
				throw new Error(`Create Invoice failed: Insert error ${JSON.stringify(invoiceInsertResult)}`)
			}

			const invoiceItemsSnap = manager.create<InvoiceItem>(InvoiceItem, invoiceInsertDto.invoiceItems)
			invoiceItemsSnap.forEach((item) => {
				item.oid = oid
				item.invoiceId = invoiceId
				item.customerId = invoiceInsertDto.customerId
			})
			await manager.insert(InvoiceItem, invoiceItemsSnap)

			return { invoiceId }
		})
	}

	async updateDraft(params: { oid: number, invoiceId: number, invoiceUpdateDto: InvoiceUpdateDto }) {
		const { oid, invoiceId, invoiceUpdateDto } = params

		return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
			const { invoiceItems, ...invoiceSnap } = manager.create<Invoice>(Invoice, invoiceUpdateDto)
			const invoiceUpdateResult = await manager.update<Invoice>(Invoice, {
				id: invoiceId,
				oid,
				status: InvoiceStatus.Draft,
			}, invoiceSnap)
			if (invoiceUpdateResult.affected !== 1) {
				throw new Error(`Update Invoice ${invoiceId} failed: Status invalid`)
			}

			const invoice = await manager.findOneBy(Invoice, { id: invoiceId, oid })

			await manager.delete(InvoiceItem, { oid, invoiceId })

			const invoiceItemsSnap = manager.create<InvoiceItem>(InvoiceItem, invoiceUpdateDto.invoiceItems)
			invoiceItemsSnap.forEach((item) => {
				item.oid = oid
				item.invoiceId = invoiceId
				item.customerId = invoice.customerId
			})
			await manager.insert(InvoiceItem, invoiceItemsSnap)

			return { invoiceId }
		})
	}

	async deleteDraft(params: { oid: number, invoiceId: number }) {
		const { oid, invoiceId } = params
		return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
			const invoiceDeleteResult = await manager.delete(Invoice, {
				oid,
				id: invoiceId,
				status: InvoiceStatus.Draft,
			})
			if (invoiceDeleteResult.affected !== 1) {
				throw new Error(`Delete Invoice ${invoiceId} failed: Status invalid`)
			}
			await manager.delete(InvoiceItem, { oid, invoiceId })
		})
	}

	async startShip(params: { oid: number, invoiceId: number, shipTime: number, }) {
		const { oid, invoiceId, shipTime } = params

		const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
			const invoiceUpdateResult = await manager.update(Invoice, {
				id: invoiceId,
				oid,
				shipTime: IsNull(),
				status: In([InvoiceStatus.Draft, InvoiceStatus.Process]),
			}, {
				shipTime,
				status: InvoiceStatus.Process,
			})
			if (invoiceUpdateResult.affected !== 1) {
				throw new Error(`Process Invoice ${invoiceId} failed: Status invalid`)
			}

			const [invoice] = await manager.find(Invoice, {
				relations: { invoiceItems: true },
				relationLoadStrategy: 'join',
				where: { oid, id: invoiceId },
			})
			if (invoice.invoiceItems.length === 0) {
				throw new Error(`Process Invoice ${invoiceId} failed: invoiceItems.length = 0`)
			}

			// check status finish
			if (invoice.shipTime && invoice.paymentTime) {
				await manager.update(Invoice, { id: invoiceId }, { status: InvoiceStatus.Finish })
			}

			// Trừ số lượng vào lô hàng
			const invoiceItemsProduct = invoice.invoiceItems.filter((i) => i.type === InvoiceItemType.ProductBatch)
			const invoiceItemIds = invoiceItemsProduct.map((i) => i.id)
			const productBatchIds = uniqueArray(invoiceItemsProduct.map((i: InvoiceItem) => i.referenceId))
			let productIds: number[] = []

			if (shipTime && invoiceItemsProduct.length) {
				// update trước để lock các bản ghi của productBatch
				const updateBatch = await manager.query(`
					UPDATE product_batch 
						LEFT JOIN ( SELECT reference_id, SUM(quantity) as sum_quantity 
							FROM invoice_item
							WHERE invoice_item.id IN (${invoiceItemIds.toString()})
							GROUP BY reference_id
						) sii 
						ON product_batch.id = sii.reference_id
					SET product_batch.quantity = product_batch.quantity - sii.sum_quantity
					WHERE product_batch.id IN (${productBatchIds.toString()})
						AND product_batch.oid = ${oid}
				`)
				if (updateBatch.affectedRows !== productBatchIds.length) {
					throw new Error(`Process Invoice ${invoiceId} failed: Some batch can't update quantity`)
				}

				const productBatches = await manager.find(ProductBatch, { where: { id: In(productBatchIds) } })
				productIds = uniqueArray(productBatches.map((i) => i.productId))

				const productMovementsSnap = invoiceItemsProduct.map((invoiceItem) => {
					const productBatch = productBatches.find((i) => i.id === invoiceItem.referenceId)
					if (!productBatch) {
						throw new Error(`Process Invoice ${invoiceId} failed: ProductBatchID ${invoiceItem.referenceId} invalid`)
					}
					// cần cập nhật số lượng vì 1 lô có thể bán 2 số lượng với 2 giá khác nhau
					productBatch.quantity = productBatch.quantity + invoiceItem.quantity // trả lại số lượng ban đầu vì ở trên đã bị update trước

					return manager.create(ProductMovement, {
						oid,
						productId: productBatch.productId,
						productBatchId: productBatch.id,
						referenceId: invoiceId,
						createTime: shipTime,
						type: ProductMovementType.Invoice,
						isRefund: false,
						openQuantity: productBatch.quantity, // quantity đã được trả đúng số lượng ban đầu ở trên
						number: -invoiceItem.quantity,
						closeQuantity: productBatch.quantity - invoiceItem.quantity,
						price: invoiceItem.actualPrice,
						totalMoney: invoiceItem.quantity * invoiceItem.actualPrice,
					})
				})
				await manager.insert(ProductMovement, productMovementsSnap)
			}

			return { productIds, invoice }
		})

		const { productIds, invoice } = transaction

		if (productIds.length) {
			await this.productRepository.calculateProductQuantity({ oid, productIds })
		}

		if (invoice.shipTime && invoice.paymentTime) {
			await this.manager.update(Invoice, { id: invoiceId }, { status: InvoiceStatus.Finish })
		}
	}

	async startPayment(params: { oid: number, invoiceId: number, paymentTime: number, debt: number }) {
		const { oid, invoiceId, paymentTime, debt } = params
		const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
			const invoiceUpdateResult = await manager.update(Invoice, {
				id: invoiceId,
				oid,
				paymentTime: IsNull(),
				status: In([InvoiceStatus.Draft, InvoiceStatus.Process]),
			}, {
				paymentTime,
				debt,
				status: InvoiceStatus.Process,
			})
			if (invoiceUpdateResult.affected !== 1) {
				throw new Error(`Payment Invoice ${invoiceId} failed: Status invalid`)
			}

			const invoice = await manager.findOneBy(Invoice, { oid, id: invoiceId })

			// Ghi nợ nếu có
			if (paymentTime && debt) {
				const updateCustomer = await manager.increment<Customer>(
					Customer,
					{ id: invoice.customerId },
					'debt',
					debt
				)
				if (updateCustomer.affected !== 1) {
					throw new Error(`Payment Invoice ${invoiceId} failed: Update customer ${invoice.customerId} invalid`)
				}

				const customer = await manager.findOneBy(Customer, { oid, id: invoice.customerId })

				const customerDebtDto = manager.create<CustomerDebt>(CustomerDebt, {
					oid,
					customerId: invoice.customerId,
					invoiceId,
					type: DebtType.Borrow,
					createTime: paymentTime,
					openDebt: customer.debt - debt, // trả lại số lượng ban đầu bị bị update ở trên
					money: debt,
					closeDebt: customer.debt,
				})
				await manager.insert(CustomerDebt, customerDebtDto)
			}
			return { invoice }
		})
		const { invoice } = transaction

		if (invoice.shipTime && invoice.paymentTime) {
			await this.manager.update(Invoice, { id: invoiceId }, { status: InvoiceStatus.Finish })
		}
	}

	async startRefund(params: { oid: number, invoiceId: number, refundTime: number }) {
		const { oid, invoiceId, refundTime } = params

		const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
			// update invoice
			const invoiceUpdateResult = await manager.update(Invoice, {
				id: invoiceId,
				oid,
				status: In([InvoiceStatus.Process, InvoiceStatus.Finish]),
			}, {
				refundTime,
				status: InvoiceStatus.Refund,
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

			// Cộng số lượng vào lô hàng
			const invoiceItemsProduct = invoice.invoiceItems.filter((i) => i.type === InvoiceItemType.ProductBatch)
			const invoiceItemIds = invoiceItemsProduct.map((i) => i.id)
			const productBatchIds = uniqueArray(invoiceItemsProduct.map((i: InvoiceItem) => i.referenceId))
			let productIds: number[] = []

			if (invoice.shipTime && invoiceItemsProduct.length) {
				// update trước để lock các bản ghi của productBatch
				const updateBatch = await manager.query(`
					UPDATE product_batch 
						LEFT JOIN ( SELECT reference_id, SUM(quantity) as sum_quantity
							FROM invoice_item
							WHERE invoice_item.id IN (${invoiceItemIds.toString()})
							GROUP BY reference_id
						) sii 
						ON product_batch.id = sii.reference_id
					SET product_batch.quantity = product_batch.quantity + sii.sum_quantity
					WHERE product_batch.id IN (${productBatchIds.toString()})
						AND product_batch.oid = ${oid}
				`)
				if (updateBatch.affectedRows !== productBatchIds.length) {
					throw new Error(`Refund Ship Invoice ${invoiceId} failed: Some batch can't update quantity`)
				}

				const productBatches = await manager.findBy(ProductBatch, { id: In(productBatchIds) })
				productIds = uniqueArray(productBatches.map((i) => i.productId))

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
						createTime: refundTime,
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

			// Bỏ ghi nợ nếu có
			if (invoice.paymentTime && invoice.debt !== 0) {
				// update trước để tạo lock cho customer
				const updateCustomer = await manager.decrement<Customer>(
					Customer,
					{ id: invoice.customerId },
					'debt',
					invoice.debt
				)
				if (updateCustomer.affected !== 1) {
					throw new Error(`Refund Invoice ${invoiceId} failed: Update customer ${invoice.customerId} invalid`)
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
					createTime: refundTime,
					openDebt: customer.debt + invoice.debt,  // Trả lại số lượng ban đầu vì đã bị update trước đó
					money: -invoice.debt,
					closeDebt: customer.debt,
				})
				await manager.insert(CustomerDebt, customerDebtDto)
			}

			return { productIds }
		})

		if (transaction.productIds.length) {
			await this.productRepository.calculateProductQuantity({
				oid,
				productIds: transaction.productIds,
			})
		}
	}
}
