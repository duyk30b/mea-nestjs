import { Injectable } from '@nestjs/common/decorators'
import { InjectEntityManager } from '@nestjs/typeorm'
import { uniqueArray } from '_libs/common/helpers/object.helper'
import { PaymentType, ProductMovementType, ReceiptStatus } from '_libs/database/common/variable'
import { Distributor, DistributorPayment, ProductBatch, ProductMovement, Receipt, ReceiptItem } from '_libs/database/entities'
import { DataSource, EntityManager, In, IsNull } from 'typeorm'
import { ProductRepository } from '../product/product.repository'
import { ReceiptInsertDto, ReceiptUpdateDto } from './receipt.dto'

@Injectable()
export class ReceiptProcessRepository {
	constructor(
		private dataSource: DataSource,
		@InjectEntityManager() private manager: EntityManager,
		private productRepository: ProductRepository
	) { }

	async createDraft(params: { oid: number, receiptInsertDto: ReceiptInsertDto }) {
		const { oid, receiptInsertDto } = params
		return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
			const receiptSnap = manager.create<Receipt>(Receipt, receiptInsertDto)
			receiptSnap.oid = oid
			receiptSnap.status = ReceiptStatus.Draft
			receiptSnap.paid = 0
			receiptSnap.debt = 0

			const receiptResult = await manager.insert(Receipt, receiptSnap)
			const receiptId = receiptResult.identifiers?.[0]?.id
			if (!receiptId) {
				throw new Error(`Create Receipt failed: Insert error ${JSON.stringify(receiptResult)}`)
			}

			const receiptItemsEntity = manager.create<ReceiptItem>(ReceiptItem, receiptInsertDto.receiptItems)
			receiptItemsEntity.forEach((item) => {
				item.oid = oid
				item.receiptId = receiptId
				item.distributorId = receiptInsertDto.distributorId
			})
			await manager.insert(ReceiptItem, receiptItemsEntity)

			return { receiptId }
		})
	}

	async updateDraft(params: { oid: number, receiptId: number, receiptUpdateDto: ReceiptUpdateDto }) {
		const { oid, receiptId, receiptUpdateDto } = params

		return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
			const { receiptItems, ...receiptSnap } = manager.create<Receipt>(Receipt, receiptUpdateDto)
			receiptSnap.paid = 0
			receiptSnap.debt = 0
			const receiptUpdateResult = await manager.update(Receipt, {
				id: receiptId,
				oid,
				status: ReceiptStatus.Draft,
			}, receiptSnap)
			if (receiptUpdateResult.affected !== 1) {
				throw new Error(`Update Receipt ${receiptId} failed: Status invalid`)
			}

			const receipt = await manager.findOneBy(Receipt, { id: receiptId, oid })

			await manager.delete(ReceiptItem, { oid, receiptId })
			const receiptItemsEntity = manager.create<ReceiptItem>(ReceiptItem, receiptUpdateDto.receiptItems)
			receiptItemsEntity.forEach((item) => {
				item.oid = oid
				item.receiptId = receiptId
				item.distributorId = receipt.distributorId
			})
			await manager.insert(ReceiptItem, receiptItemsEntity)

			return { receiptId }
		})
	}

	async destroyDraft(params: { oid: number, receiptId: number }) {
		const { oid, receiptId } = params
		return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
			const receiptDeleteResult = await manager.delete(Receipt, {
				oid,
				id: receiptId,
				status: ReceiptStatus.Draft,
			})
			if (receiptDeleteResult.affected !== 1) {
				throw new Error(`Delete Receipt ${receiptId} failed: Status invalid`)
			}
			await manager.delete(ReceiptItem, { oid, receiptId })
		})
	}

	async prepayment(params: { oid: number, receiptId: number, time: number, money: number }) {
		const { oid, receiptId, time, money } = params
		const transaction = await this.dataSource.transaction('REPEATABLE READ', async (manager) => {
			const receipt = await manager.findOneBy(Receipt, { id: receiptId, oid })
			if (![ReceiptStatus.Draft, ReceiptStatus.AwaitingShipment].includes(receipt.status)) {
				throw new Error(`Prepayment Receipt ${receiptId} failed: Status invalid`)
			}
			if (money > (receipt.totalMoney - receipt.paid)) {
				throw new Error(`Prepayment Receipt ${receiptId} failed: Money number invalid, max: ${receipt.totalMoney - receipt.paid}`)
			}
			if (receipt.status === ReceiptStatus.Draft && money < 0) {
				throw new Error(`Prepayment Receipt ${receiptId} failed: Money number invalid`)
			}
			if (receipt.status === ReceiptStatus.AwaitingShipment && money <= 0) {
				throw new Error(`Prepayment Receipt ${receiptId} failed: Money number invalid`)
			}

			// Lưu lịch sử trả tiền
			if (money > 0) {
				const distributorPaymentInsertResult = await manager.insert(DistributorPayment, {
					oid,
					distributorId: receipt.distributorId,
					receiptId,
					time,
					type: PaymentType.Prepayment,
					paid: money,
					debit: 0, // prepayment không phát sinh nợ
				})
				const distributorPaymentId: number = distributorPaymentInsertResult.identifiers?.[0]?.id
				if (!distributorPaymentId) {
					throw new Error(`Create DistributorPayment failed: Insert error ${JSON.stringify(distributorPaymentInsertResult)}`)
				}
			}

			const receiptUpdateResult = await manager.update(Receipt, { id: receiptId }, {
				status: ReceiptStatus.AwaitingShipment,
				paid: receipt.paid + money,
				debt: 0, // thanh toán trước nên không tính là nợ
			})
			if (receiptUpdateResult.affected !== 1) {
				throw new Error(`Payment Receipt ${receiptId} failed: Update failed`)
			}
		})
	}

	async startShipAndPayment(params: { oid: number, receiptId: number, time: number, money: number }) {
		const { oid, receiptId, time, money } = params

		const transaction = await this.dataSource.transaction('REPEATABLE READ', async (manager) => {
			const [receipt] = await manager.find(Receipt, {
				relations: { receiptItems: true },
				relationLoadStrategy: 'join',
				where: { oid, id: receiptId },
			})
			if (![ReceiptStatus.Draft, ReceiptStatus.AwaitingShipment].includes(receipt.status)) {
				throw new Error(`Process Receipt ${receiptId} failed: Status invalid`)
			}
			if (receipt.receiptItems.length === 0) {
				throw new Error(`Process Receipt ${receiptId} failed: Not found receipt_items`)
			}

			const debit = receipt.totalMoney - receipt.paid - money // Ghi nợ
			let openDebt = null

			// Có nợ => thêm nợ vào NCC
			if (debit) {
				const distributor = await manager.findOneBy(Distributor, {
					oid,
					id: receipt.distributorId,
				})
				openDebt = distributor.debt
				const updateDistributor = await manager.increment<Distributor>(
					Distributor,
					{ id: receipt.distributorId },
					'debt',
					debit
				)
				if (updateDistributor.affected !== 1) {
					throw new Error(`Payment Receipt ${receiptId} failed: Update distributor ${receipt.distributorId} invalid`)
				}
			}

			// Lưu lịch sử trả tiền vào distributorPayment
			const distributorPaymentInsertResult = await manager.insert(DistributorPayment, {
				oid,
				distributorId: receipt.distributorId,
				receiptId,
				time,
				type: PaymentType.ImmediatePayment,
				paid: money,
				debit: debit != null ? debit : 0,
				openDebt: debit != null ? openDebt : null, // nếu có nợ thì ghi thêm thay đổi nợ
				closeDebt: debit != null ? openDebt + debit : null, // nếu có nợ thì ghi thêm thay đổi nợ
			})
			const distributorPaymentId: number = distributorPaymentInsertResult.identifiers?.[0]?.id
			if (!distributorPaymentId) {
				throw new Error(`Create DistributorPayment failed: Insert error ${JSON.stringify(distributorPaymentInsertResult)}`)
			}

			// Lưu Receipt
			const receiptUpdateResult = await manager.update(Receipt, { id: receiptId }, {
				status: debit > 0 ? ReceiptStatus.Debt : ReceiptStatus.Success,
				debt: debit,
				paid: receipt.paid + money,
			})
			if (receiptUpdateResult.affected !== 1) {
				throw new Error(`Process Receipt ${receiptId} failed: Status invalid`)
			}

			// Cộng số lượng vào lô hàng
			const productBatchIds = uniqueArray(receipt.receiptItems.map((i) => i.productBatchId))
			let productIds: number[] = []

			if (receipt.receiptItems.length) {
				// update trước để lock các bản ghi của productBatch
				const updateBatch = await manager.query(`
					UPDATE product_batch 
						LEFT JOIN ( SELECT product_batch_id, SUM(quantity) as sum_quantity 
							FROM receipt_item
							WHERE receipt_item.receipt_id = ${receipt.id} AND receipt_item.oid = ${oid}
							GROUP BY product_batch_id
						) sri 
						ON product_batch.id = sri.product_batch_id
					SET product_batch.quantity = product_batch.quantity + sri.sum_quantity
					WHERE product_batch.id IN (${productBatchIds.toString()})
						AND product_batch.oid = ${oid}
				`)

				if (updateBatch.affectedRows !== productBatchIds.length) {
					throw new Error(`Process Receipt ${receiptId} failed: Some batch can't update quantity`)
				}

				const productBatches = await manager.findBy(ProductBatch, { id: In(productBatchIds) })
				productIds = uniqueArray(productBatches.map((i) => i.productId))

				const productMovementsEntity = receipt.receiptItems.map((receiptItem) => {
					const productBatch = productBatches.find((i) => i.id === receiptItem.productBatchId)
					if (!productBatch) {
						throw new Error(`Process Receipt ${receiptId} failed: ProductBatchID ${receiptItem.productBatchId} invalid`)
					}
					// cần phải cập nhật số lượng vì có thể nhiều sản phẩm cùng update số lượng
					productBatch.quantity = productBatch.quantity - receiptItem.quantity // trả lại số lượng ban đầu vì ở trên đã bị update trước

					return manager.create(ProductMovement, {
						oid,
						productId: productBatch.productId,
						productBatchId: productBatch.id,
						referenceId: receiptId,
						createTime: time,
						type: ProductMovementType.Receipt,
						isRefund: false,
						openQuantity: productBatch.quantity,
						number: receiptItem.quantity,
						closeQuantity: productBatch.quantity + receiptItem.quantity,
						price: productBatch.costPrice,
						totalMoney: receiptItem.quantity * productBatch.costPrice,
					})
				})
				await manager.insert(ProductMovement, productMovementsEntity)
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

	async payDebt(params: { oid: number, receiptId: number, time: number, money: number }) {
		const { oid, receiptId, time, money } = params
		const transaction = await this.dataSource.transaction('REPEATABLE READ', async (manager) => {
			const receipt = await manager.findOneBy(Receipt, { id: receiptId, oid })
			if (![ReceiptStatus.Debt].includes(receipt.status)) {
				throw new Error(`Prepayment Receipt ${receiptId} failed: Status invalid`)
			}
			if (money <= 0 || money > receipt.debt) {
				throw new Error(`Prepayment Receipt ${receiptId} failed: Money number invalid`)
			}

			// Trừ nợ khách hàng
			const distributor = await manager.findOneBy(Distributor, {
				oid,
				id: receipt.distributorId,
			})
			const openDebt = distributor.debt
			const updateDistributor = await manager.decrement<Distributor>(
				Distributor,
				{ id: receipt.distributorId },
				'debt',
				money
			)
			if (updateDistributor.affected !== 1) {
				throw new Error(`Refund Receipt ${receiptId} failed: Update distributor ${receipt.distributorId} invalid`)
			}

			// Lưu lịch sử trả tiền
			const distributorPaymentInsertResult = await manager.insert(DistributorPayment, {
				oid,
				distributorId: receipt.distributorId,
				receiptId,
				time,
				type: PaymentType.PayDebt,
				paid: money,
				openDebt,
				debit: -money,
				closeDebt: openDebt - money,
			})

			const distributorPaymentId: number = distributorPaymentInsertResult.identifiers?.[0]?.id
			if (!distributorPaymentId) {
				throw new Error(`Create DistributorPayment failed: Insert error ${JSON.stringify(distributorPaymentInsertResult)}`)
			}

			const receiptUpdateResult = await manager.update(Receipt, { id: receiptId }, {
				status: money === receipt.debt ? ReceiptStatus.Success : ReceiptStatus.Debt,
				debt: receipt.debt - money,
				paid: receipt.paid + money,
			})
			if (receiptUpdateResult.affected !== 1) {
				throw new Error(`Payment Receipt ${receiptId} failed: Update failed`)
			}
		})
	}

	async startRefund(params: { oid: number, receiptId: number, time: number }) {
		const { oid, receiptId, time } = params
		const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
			const [receipt] = await manager.find(Receipt, {
				relations: { receiptItems: true },
				relationLoadStrategy: 'join',
				where: { oid, id: receiptId },
			})
			if (receipt.receiptItems.length === 0) {
				throw new Error(`Refund Receipt ${receiptId} failed: receiptItems.length = 0 `)
			}
			if (![ReceiptStatus.AwaitingShipment, ReceiptStatus.Debt, ReceiptStatus.Success].includes(receipt.status)) {
				throw new Error(`Prepayment Receipt ${receiptId} failed: Status invalid`)
			}

			// Hoàn trả nợ vào NCC nếu có
			let openDebt = null
			if (receipt.debt !== 0) {
				const distributor = await manager.findOneBy(Distributor, {
					oid,
					id: receipt.distributorId,
				})
				openDebt = distributor.debt
				const updateDistributor = await manager.decrement<Distributor>(
					Distributor,
					{ id: receipt.distributorId },
					'debt',
					receipt.debt
				)
				if (updateDistributor.affected !== 1) {
					throw new Error(`Refund Receipt ${receiptId} failed: Update distributor ${receipt.distributorId} invalid`)
				}
			}

			// Lưu lịch sử nhận hoàn trả tiền
			const distributorPaymentInsertResult = await manager.insert(DistributorPayment, {
				oid,
				distributorId: receipt.distributorId,
				receiptId,
				time,
				type: PaymentType.ReceiveRefund,
				paid: -receipt.paid,
				openDebt: openDebt != null ? openDebt : null,
				debit: -receipt.debt,
				closeDebt: openDebt != null ? openDebt - receipt.debt : null,
			})

			const distributorPaymentId: number = distributorPaymentInsertResult.identifiers?.[0]?.id
			if (!distributorPaymentId) {
				throw new Error(`Create DistributorPayment failed: Insert error ${JSON.stringify(distributorPaymentInsertResult)}`)
			}

			const receiptUpdateResult = await manager.update(Receipt, { id: receiptId }, {
				status: ReceiptStatus.Refund,
				debt: 0,
				paid: 0,
			})
			if (receiptUpdateResult.affected !== 1) {
				throw new Error(`Refund Receipt ${receiptId} failed: Receipt ${receiptId} invalid`)
			}

			// Trừ số lượng vào lô hàng
			let productIds: number[] = []
			const productBatchIds = uniqueArray(receipt.receiptItems.map((i) => i.productBatchId))

			if (receipt.receiptItems.length) {
				// update trước để lock các bản ghi của productBatch
				const updateBatch = await manager.query(`
					UPDATE product_batch 
						LEFT JOIN ( SELECT product_batch_id, SUM(quantity) as sum_quantity 
							FROM receipt_item
							WHERE receipt_item.receipt_id = ${receipt.id} AND receipt_item.oid = ${oid}
							GROUP BY product_batch_id
						) receipt_item 
						ON product_batch.id = receipt_item.product_batch_id
					SET product_batch.quantity = product_batch.quantity - receipt_item.sum_quantity
					WHERE product_batch.id IN (${productBatchIds.toString()})
						AND product_batch.oid = ${oid}
				`)
				if (updateBatch.affectedRows !== productBatchIds.length) {
					throw new Error(`Refund Receipt ${receiptId} failed: Some batch can't update quantity`)
				}

				const productBatches = await manager.findBy(ProductBatch, { id: In(productBatchIds) })
				productIds = uniqueArray(productBatches.map((i) => i.productId))

				const productMovementsEntity = receipt.receiptItems.map((receiptItem) => {
					const productBatch = productBatches.find((i) => i.id === receiptItem.productBatchId)
					if (!productBatch) {
						throw new Error(`Refund Receipt ${receiptId} failed: ProductBatchID ${receiptItem.productBatchId} invalid`)
					}
					// cần phải cập nhật số lượng vì có thể nhiều sản phẩm cùng update số lượng
					productBatch.quantity = productBatch.quantity + receiptItem.quantity // trả lại số lượng ban đầu vì ở trên đã bị update trước

					return manager.create(ProductMovement, {
						oid,
						productId: productBatch.productId,
						productBatchId: productBatch.id,
						referenceId: receiptId,
						type: ProductMovementType.Receipt,
						createTime: time,
						isRefund: true,
						openQuantity: productBatch.quantity,
						number: -receiptItem.quantity,
						closeQuantity: productBatch.quantity - receiptItem.quantity,
						price: productBatch.costPrice,
						totalMoney: (-receiptItem.quantity) * productBatch.costPrice,
					})
				})
				await manager.insert(ProductMovement, productMovementsEntity)
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

	async softDeleteRefund(params: { oid: number, receiptId: number }) {
		const { oid, receiptId } = params
		const receiptUpdateResult = await this.manager.update(Receipt, {
			id: receiptId,
			oid,
			status: ReceiptStatus.Refund,
			deleteTime: IsNull(),
		}, { deleteTime: Date.now() })
		if (receiptUpdateResult.affected !== 1) {
			throw new Error(`Delete Receipt ${receiptId} failed: Status invalid`)
		}
	}
}
