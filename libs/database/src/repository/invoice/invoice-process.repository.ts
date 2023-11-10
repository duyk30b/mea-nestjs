import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { uniqueArray } from '_libs/common/helpers/object.helper'
import { InvoiceItemType, InvoiceStatus, PaymentType, ProductMovementType } from '_libs/database/common/variable'
import { Customer, Invoice, InvoiceItem, ProductBatch, ProductMovement } from '_libs/database/entities'
import CustomerPayment from '_libs/database/entities/customer-payment.entity'
import { DataSource, EntityManager, In, IsNull } from 'typeorm'
import { ProductRepository } from '../product/product.repository'
import { InvoiceDraftInsertDto, InvoiceDraftUpdateDto } from './invoice.dto'

@Injectable()
export class InvoiceProcessRepository {
	constructor(
		private dataSource: DataSource,
		@InjectEntityManager() private manager: EntityManager,
		private productRepository: ProductRepository
	) { }

	async createDraft(params: { oid: number, invoiceInsertDto: InvoiceDraftInsertDto, }) {
		const { oid, invoiceInsertDto } = params

		return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
			const { invoiceItems, ...invoiceSnap } = manager.create<Invoice>(Invoice, invoiceInsertDto)
			invoiceSnap.oid = oid
			invoiceSnap.status = InvoiceStatus.Draft
			invoiceSnap.paid = 0
			invoiceSnap.debt = 0

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

	async updateDraft(params: { oid: number, invoiceId: number, invoiceUpdateDto: InvoiceDraftUpdateDto }) {
		const { oid, invoiceId, invoiceUpdateDto } = params

		return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
			const { invoiceItems, ...invoiceSnap } = manager.create<Invoice>(Invoice, invoiceUpdateDto)
			invoiceSnap.paid = 0
			invoiceSnap.debt = 0
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

	async destroyDraft(params: { oid: number, invoiceId: number }) {
		const { oid, invoiceId } = params
		return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
			const invoiceDeleteResult = await manager.delete(Invoice, {
				oid,
				id: invoiceId,
				status: InvoiceStatus.Draft,
			})
			if (invoiceDeleteResult.affected !== 1) {
				throw new Error(`Destroy Invoice ${invoiceId} failed: Status invalid`)
			}
			await manager.delete(InvoiceItem, { oid, invoiceId })
		})
	}

	async prepayment(params: { oid: number, invoiceId: number, time: number, money: number }) {
		const { oid, invoiceId, time, money } = params
		const transaction = await this.dataSource.transaction('REPEATABLE READ', async (manager) => {
			const invoice = await manager.findOneBy(Invoice, { id: invoiceId, oid })
			if (![InvoiceStatus.Draft, InvoiceStatus.AwaitingShipment].includes(invoice.status)) {
				throw new Error(`Prepayment Invoice ${invoiceId} failed: Status invalid`)
			}
			if (money > (invoice.totalMoney - invoice.paid)) {
				throw new Error(`Prepayment Invoice ${invoiceId} failed: Money number invalid, max: ${invoice.totalMoney - invoice.paid}`)
			}
			if (invoice.status === InvoiceStatus.Draft && money < 0) {
				throw new Error(`Prepayment Invoice ${invoiceId} failed: Money number invalid`)
			}
			if (invoice.status === InvoiceStatus.AwaitingShipment && money <= 0) {
				throw new Error(`Prepayment Invoice ${invoiceId} failed: Money number invalid`)
			}

			// Lưu lịch sử trả tiền
			if (money > 0) {
				const customerPaymentInsertResult = await manager.insert(CustomerPayment, {
					oid,
					customerId: invoice.customerId,
					invoiceId,
					time,
					type: PaymentType.Prepayment,
					paid: money,
					debit: 0, // prepayment không phát sinh nợ
				})
				const customerPaymentId: number = customerPaymentInsertResult.identifiers?.[0]?.id
				if (!customerPaymentId) {
					throw new Error(`Create CustomerPayment failed: Insert error ${JSON.stringify(customerPaymentInsertResult)}`)
				}
			}

			const invoiceUpdateResult = await manager.update(Invoice, { id: invoiceId }, {
				status: InvoiceStatus.AwaitingShipment,
				paid: invoice.paid + money,
				debt: 0, // thanh toán trước nên không tính là nợ
			})
			if (invoiceUpdateResult.affected !== 1) {
				throw new Error(`Payment Invoice ${invoiceId} failed: Update failed`)
			}
		})
	}

	async startShipAndPayment(params: { oid: number, invoiceId: number, time: number, money: number }) {
		const { oid, invoiceId, time, money } = params

		const transaction = await this.dataSource.transaction('REPEATABLE READ', async (manager) => {
			const [invoice] = await manager.find(Invoice, {
				relations: { invoiceItems: true },
				relationLoadStrategy: 'join',
				where: { oid, id: invoiceId },
			})
			if (![InvoiceStatus.AwaitingShipment, InvoiceStatus.Draft].includes(invoice.status)) {
				throw new Error(`Process Invoice ${invoiceId} failed: Status invalid`)
			}
			if (invoice.invoiceItems.length === 0) {
				throw new Error(`Process Invoice ${invoiceId} failed: invoiceItems.length = 0`)
			}

			const debit = invoice.totalMoney - invoice.paid - money // Ghi nợ
			let openDebt = null

			// Có nợ => thêm nợ vào khách hàng
			if (debit) {
				const customer = await manager.findOneBy(Customer, {
					oid,
					id: invoice.customerId,
				})
				openDebt = customer.debt
				const updateCustomer = await manager.increment<Customer>(
					Customer,
					{ id: invoice.customerId },
					'debt',
					debit
				)
				if (updateCustomer.affected !== 1) {
					throw new Error(`Payment Invoice ${invoiceId} failed: Update customer ${invoice.customerId} invalid`)
				}
			}

			// Lưu lịch sử trả tiền vào customerPayment
			const customerPaymentInsertResult = await manager.insert(CustomerPayment, {
				oid,
				customerId: invoice.customerId,
				invoiceId,
				time,
				type: PaymentType.ImmediatePayment,
				paid: money,
				debit: debit != null ? debit : 0,
				openDebt: debit != null ? openDebt : null, // nếu có nợ thì ghi thêm thay đổi nợ
				closeDebt: debit != null ? openDebt + debit : null, // nếu có nợ thì ghi thêm thay đổi nợ
			})
			const customerPaymentId: number = customerPaymentInsertResult.identifiers?.[0]?.id
			if (!customerPaymentId) {
				throw new Error(`Create CustomerPayment failed: Insert error ${JSON.stringify(customerPaymentInsertResult)}`)
			}

			// Lưu invoice
			const invoiceUpdateResult = await manager.update(Invoice, { id: invoiceId }, {
				status: debit > 0 ? InvoiceStatus.Debt : InvoiceStatus.Success,
				debt: debit,
				paid: invoice.paid + money,
			})
			if (invoiceUpdateResult.affected !== 1) {
				throw new Error(`Payment Invoice ${invoiceId} failed: Update failed`)
			}

			// Trừ số lượng vào lô hàng
			const invoiceItemsProduct = invoice.invoiceItems.filter((i) => i.type === InvoiceItemType.ProductBatch)
			const invoiceItemIds = invoiceItemsProduct.map((i) => i.id)
			const productBatchIds = uniqueArray(invoiceItemsProduct.map((i: InvoiceItem) => i.referenceId))
			let productIds: number[] = []

			if (invoiceItemsProduct.length) {
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
						createTime: time,
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

			return { productIds }
		})

		const { productIds } = transaction

		if (productIds.length) {
			await this.productRepository.calculateProductQuantity({
				oid,
				productIds,
			})
		}
	}

	async payDebt(params: { oid: number, invoiceId: number, time: number, money: number }) {
		const { oid, invoiceId, time, money } = params
		const transaction = await this.dataSource.transaction('REPEATABLE READ', async (manager) => {
			const invoice = await manager.findOneBy(Invoice, { id: invoiceId, oid })
			if (![InvoiceStatus.Debt].includes(invoice.status)) {
				throw new Error(`Prepayment Invoice ${invoiceId} failed: Status invalid`)
			}
			if (money <= 0 || money > invoice.debt) {
				throw new Error(`Prepayment Invoice ${invoiceId} failed: Money number invalid`)
			}

			// Trừ nợ khách hàng
			const customer = await manager.findOneBy(Customer, {
				oid,
				id: invoice.customerId,
			})
			const openDebt = customer.debt
			const updateCustomer = await manager.decrement<Customer>(
				Customer,
				{ id: invoice.customerId },
				'debt',
				money
			)
			if (updateCustomer.affected !== 1) {
				throw new Error(`Refund Invoice ${invoiceId} failed: Update customer ${invoice.customerId} invalid`)
			}

			// Lưu lịch sử trả tiền
			const customerPaymentInsertResult = await manager.insert(CustomerPayment, {
				oid,
				customerId: invoice.customerId,
				invoiceId,
				time,
				type: PaymentType.PayDebt,
				paid: money,
				openDebt,
				debit: -money,
				closeDebt: openDebt - money,
			})

			const customerPaymentId: number = customerPaymentInsertResult.identifiers?.[0]?.id
			if (!customerPaymentId) {
				throw new Error(`Create CustomerPayment failed: Insert error ${JSON.stringify(customerPaymentInsertResult)}`)
			}

			const invoiceUpdateResult = await manager.update(Invoice, { id: invoiceId }, {
				status: money === invoice.debt ? InvoiceStatus.Success : InvoiceStatus.Debt,
				debt: invoice.debt - money,
				paid: invoice.paid + money,
			})
			if (invoiceUpdateResult.affected !== 1) {
				throw new Error(`Payment Invoice ${invoiceId} failed: Update failed`)
			}
		})
	}

	async startRefund(params: { oid: number, invoiceId: number, time: number }) {
		const { oid, invoiceId, time } = params

		const transaction = await this.dataSource.transaction('REPEATABLE READ', async (manager) => {
			// Check trạng thái invoice đầu tiên
			const [invoice] = await manager.find(Invoice, {
				relations: { invoiceItems: true },
				relationLoadStrategy: 'join',
				where: { oid, id: invoiceId },
			})
			if (invoice.invoiceItems.length === 0) {
				throw new Error(`Refund Invoice ${invoiceId} failed: invoiceItems.length = 0 `)
			}
			if (![InvoiceStatus.AwaitingShipment, InvoiceStatus.Debt, InvoiceStatus.Success].includes(invoice.status)) {
				throw new Error(`Prepayment Invoice ${invoiceId} failed: Status invalid`)
			}

			// Hoàn trả nợ vào khách hàng nếu có
			let openDebt = null
			if (invoice.debt !== 0) {
				const customer = await manager.findOneBy(Customer, {
					oid,
					id: invoice.customerId,
				})
				openDebt = customer.debt
				const updateCustomer = await manager.decrement<Customer>(
					Customer,
					{ id: invoice.customerId },
					'debt',
					invoice.debt
				)
				if (updateCustomer.affected !== 1) {
					throw new Error(`Refund Invoice ${invoiceId} failed: Update customer ${invoice.customerId} invalid`)
				}
			}

			// Lưu lịch sử nhận hoàn tiền
			const customerPaymentInsertResult = await manager.insert(CustomerPayment, {
				oid,
				customerId: invoice.customerId,
				invoiceId,
				time,
				type: PaymentType.ReceiveRefund,
				paid: -invoice.paid,
				openDebt: openDebt != null ? openDebt : null,
				debit: -invoice.debt,
				closeDebt: openDebt != null ? openDebt - invoice.debt : null,
			})

			const customerPaymentId: number = customerPaymentInsertResult.identifiers?.[0]?.id
			if (!customerPaymentId) {
				throw new Error(`Create CustomerPayment failed: Insert error ${JSON.stringify(customerPaymentInsertResult)}`)
			}

			const invoiceUpdateResult = await manager.update(Invoice, { id: invoiceId }, {
				status: InvoiceStatus.Refund,
				paid: 0,
				debt: 0,
			})
			if (invoiceUpdateResult.affected !== 1) {
				throw new Error(`Refund Invoice ${invoiceId} failed: Invoice ${invoiceId} invalid`)
			}

			// Cộng số lượng vào lô hàng
			const invoiceItemsProduct = invoice.invoiceItems.filter((i) => i.type === InvoiceItemType.ProductBatch)
			const invoiceItemIds = invoiceItemsProduct.map((i) => i.id)
			const productBatchIds = uniqueArray(invoiceItemsProduct.map((i: InvoiceItem) => i.referenceId))
			let productIds: number[] = []

			// nếu đã gửi hàng thì phải trả hàng
			if (invoiceItemsProduct.length) {
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

			return { productIds }
		})

		if (transaction.productIds.length) {
			await this.productRepository.calculateProductQuantity({
				oid,
				productIds: transaction.productIds,
			})
		}
	}

	async softDeleteRefund(params: { oid: number, invoiceId: number }) {
		const { oid, invoiceId } = params
		const invoiceUpdateResult = await this.manager.update(Invoice, {
			id: invoiceId,
			oid,
			status: InvoiceStatus.Refund,
			deleteTime: IsNull(),
		}, { deleteTime: Date.now() })
		if (invoiceUpdateResult.affected !== 1) {
			throw new Error(`Delete Invoice ${invoiceId} failed: Status invalid`)
		}
	}
}
