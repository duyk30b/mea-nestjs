import { Injectable } from '@nestjs/common/decorators'
import { InjectEntityManager } from '@nestjs/typeorm'
import { uniqueArray } from '_libs/common/helpers/object.helper'
import { DebtType, PaymentStatus, ProductMovementType } from '_libs/database/common/variable'
import { Distributor, DistributorDebt, ProductBatch, ProductMovement, Purchase, Receipt, ReceiptItem } from '_libs/database/entities'
import { DataSource, EntityManager, In } from 'typeorm'
import { ReceiptInsertDto, ReceiptUpdateDto } from './purchase-receipt.dto'

@Injectable()
export class PurchaseReceiptRepository {
	constructor(
		private dataSource: DataSource,
		@InjectEntityManager() private manager: EntityManager
	) { }

	async createReceiptDraft(oid: number, receiptInsertDto: ReceiptInsertDto, time: number) {
		return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
			const purchaseSnap = manager.create<Purchase>(Purchase, {
				oid,
				distributorId: receiptInsertDto.distributorId,
				paymentStatus: PaymentStatus.Unpaid,
				createTime: time,
				totalMoney: receiptInsertDto.totalMoney,
				debt: receiptInsertDto.debt,
			})
			const purchaseResult = await manager.insert(Purchase, purchaseSnap)
			const purchaseId = purchaseResult.identifiers?.[0]?.id
			if (!purchaseId) {
				throw new Error(`Create Purchase failed: Insert error ${JSON.stringify(purchaseResult)}`)
			}

			const receiptSnap = manager.create<Receipt>(Receipt, receiptInsertDto)
			receiptSnap.oid = oid
			receiptSnap.purchaseId = purchaseId
			receiptSnap.paymentStatus = PaymentStatus.Unpaid
			const receiptResult = await manager.insert(Receipt, receiptSnap)
			const receiptId = receiptResult.identifiers?.[0]?.id
			if (!receiptId) {
				throw new Error(`Create Purchase failed: Insert error ${JSON.stringify(receiptResult)}`)
			}

			const receiptItemsEntity = manager.create<ReceiptItem>(ReceiptItem, receiptInsertDto.receiptItems)
			receiptItemsEntity.forEach((item) => {
				item.oid = oid
				item.receiptId = receiptId
			})
			await manager.insert(ReceiptItem, receiptItemsEntity)

			return { purchaseId, receiptId }
		})
	}

	async updateReceiptDraft(oid: number, receiptId: number, receiptUpdateDto: ReceiptUpdateDto) {
		return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
			const { receiptItems, ...receiptSnap } = manager.create<Receipt>(Receipt, receiptUpdateDto)
			const { affected } = await manager.update(Receipt, {
				id: receiptId,
				oid,
				paymentStatus: PaymentStatus.Unpaid,
			}, receiptSnap)
			if (affected !== 1) {
				throw new Error(`Update Receipt ${receiptId} failed: Status invalid`)
			}

			const [receipt] = await manager.find(Receipt, { where: { id: receiptId, oid } })
			const { purchaseId } = receipt
			const updatePurchase = await manager.update(Purchase, {
				oid,
				id: purchaseId,
				paymentStatus: PaymentStatus.Unpaid,
			}, {
				totalMoney: receiptUpdateDto.totalMoney,
				debt: receiptUpdateDto.debt,
			})
			if (updatePurchase.affected !== 1) {
				throw new Error(`Update Arrival ${purchaseId} failed: Status invalid`)
			}

			await manager.delete(ReceiptItem, { oid, receiptId })
			const receiptItemsEntity = manager.create<ReceiptItem>(ReceiptItem, receiptUpdateDto.receiptItems)
			receiptItemsEntity.forEach((item) => {
				item.oid = oid
				item.receiptId = receiptId
			})
			await manager.insert(ReceiptItem, receiptItemsEntity)

			return { purchaseId, receiptId }
		})
	}

	async createReceiptDraftAfterRefund(oid: number, purchaseId: number, receiptInsertDto: ReceiptInsertDto) {
		return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
			const updatePurchase = await manager.update(Purchase, {
				oid,
				id: purchaseId,
				paymentStatus: PaymentStatus.Refund,
			}, {
				totalMoney: receiptInsertDto.totalMoney,
				debt: receiptInsertDto.debt,
				paymentStatus: PaymentStatus.Unpaid,
			})
			if (updatePurchase.affected !== 1) {
				throw new Error(`Create Receipt for Purchase ${purchaseId} failed: Status invalid`)
			}

			const receiptSnap = manager.create<Receipt>(Receipt, receiptInsertDto)
			receiptSnap.oid = oid
			receiptSnap.purchaseId = purchaseId
			receiptSnap.paymentStatus = PaymentStatus.Unpaid
			const receiptResult = await manager.insert(Receipt, receiptSnap)
			const receiptId = receiptResult.identifiers?.[0]?.id
			if (!receiptId) {
				throw new Error(`Create Receipt for Purchase ${purchaseId} failed: Insert error ${JSON.stringify(receiptResult)}`)
			}

			const receiptItemsEntity = manager.create<ReceiptItem>(ReceiptItem, receiptInsertDto.receiptItems)
			receiptItemsEntity.forEach((item) => {
				item.oid = oid
				item.receiptId = receiptId
			})
			await manager.insert(ReceiptItem, receiptItemsEntity)

			return { purchaseId, receiptId }
		})
	}

	async paymentReceiptDraft(oid: number, receiptId: number, time: number) {
		return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
			const { affected } = await manager.update(Receipt, {
				id: receiptId,
				oid,
				paymentStatus: PaymentStatus.Unpaid,
			}, {
				paymentStatus: PaymentStatus.Full,
				paymentTime: time,
			})
			if (affected !== 1) {
				throw new Error(`Payment Receipt ${receiptId} failed: Status invalid`)
			}

			const [receipt] = await manager.find(Receipt, {
				relations: { receiptItems: true },
				relationLoadStrategy: 'join',
				where: { oid, id: receiptId },
			})
			if (receipt.receiptItems.length === 0) {
				throw new Error(`Payment Receipt ${receiptId} failed: Not found receipt_items`)
			}
			const { purchaseId } = receipt

			const updatePurchase = await manager.update(Purchase, { id: receipt.purchaseId }, {
				totalMoney: receipt.totalMoney,
				debt: receipt.debt,
				createTime: time,
				paymentStatus: PaymentStatus.Full,
			})
			if (updatePurchase.affected !== 1) {
				throw new Error(`Payment Receipt ${receiptId} failed: Purchase ${purchaseId} invalid`)
			}

			// Cộng số lượng vào lô hàng
			if (receipt.receiptItems.length) {
				const productBatchIds = uniqueArray(receipt.receiptItems.map((i) => i.productBatchId))
				// update trước để lock các bản ghi của productBatch
				const updateBatch = await manager.query(`
					UPDATE product_batch 
						LEFT JOIN ( SELECT product_batch_id, SUM(quantity) as sum_quantity 
							FROM receipt_item
							WHERE receipt_item.receipt_id = ${receipt.id} AND receipt_item.oid = ${oid}
							GROUP BY product_batch_id
						) receipt_item 
						ON product_batch.id = receipt_item.product_batch_id
					SET product_batch.quantity = product_batch.quantity + receipt_item.sum_quantity
					WHERE product_batch.id IN (${productBatchIds.toString()})
						AND product_batch.oid = ${oid}
				`)

				if (updateBatch.affectedRows !== productBatchIds.length) {
					throw new Error(`Payment Receipt ${receiptId} failed: Some batch can't update quantity`)
				}

				const productBatches = await manager.findBy(ProductBatch, { id: In(productBatchIds) })

				const productMovementsEntity = receipt.receiptItems.map((receiptItem) => {
					const productBatch = productBatches.find((i) => i.id === receiptItem.productBatchId)
					if (!productBatch) {
						throw new Error(`Payment Receipt ${receiptId} failed: ProductBatchID ${receiptItem.productBatchId} invalid`)
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
			// Ghi nợ nếu có
			if (receipt.debt) {
				// use update for lock distributor
				const updateDistributor = await manager.increment<Distributor>(
					Distributor,
					{ id: receipt.distributorId },
					'debt',
					receipt.debt
				)
				if (updateDistributor.affected !== 1) {
					throw new Error(`Payment Receipt ${receiptId} failed: Update distributor ${receipt.distributorId} invalid`)
				}

				const distributor = await manager.findOne(Distributor, {
					where: { oid, id: receipt.distributorId },
					select: { debt: true },
				})

				const distributorDebtDto = manager.create<DistributorDebt>(DistributorDebt, {
					oid,
					distributorId: receipt.distributorId,
					receiptId,
					type: DebtType.Borrow,
					createTime: time,
					openDebt: distributor.debt - receipt.debt, // do đã bị update ở trên
					money: receipt.debt,
					closeDebt: distributor.debt,
				})
				await manager.insert(DistributorDebt, distributorDebtDto)
			}
			return { purchaseId, receiptId }
		})
	}

	async refundReceipt(oid: number, receiptId: number, time: number) {
		return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
			const { affected } = await manager.update(Receipt, {
				id: receiptId,
				oid,
				paymentStatus: PaymentStatus.Full,
			}, {
				paymentStatus: PaymentStatus.Refund,
				refundTime: time,
			})
			if (affected !== 1) {
				throw new Error(`Refund Receipt ${receiptId} failed: Receipt ${receiptId} invalid`)
			}

			const [receipt] = await manager.find(Receipt, {
				relations: { receiptItems: true },
				relationLoadStrategy: 'join',
				where: { oid, id: receiptId },
			})
			if (receipt.receiptItems.length === 0) {
				throw new Error(`Refund Receipt ${receiptId} failed: Not found receipt_items`)
			}
			const { purchaseId } = receipt

			const updatePurchase = await manager.update(Purchase, { oid, id: receipt.purchaseId }, {
				totalMoney: receipt.totalMoney,
				debt: receipt.debt,
				createTime: time,
				paymentStatus: PaymentStatus.Refund,
			})
			if (updatePurchase.affected !== 1) {
				throw new Error(`Refund Receipt ${receiptId} failed: Purchase ${purchaseId} invalid`)
			}

			// Trừ số lượng vào lô hàng
			if (receipt.receiptItems.length) {
				const productBatchIds = uniqueArray(receipt.receiptItems.map((i) => i.productBatchId))
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

			// Ghi nợ nếu có
			if (receipt.debt) {
				// update trước để tạo lock cho distributor
				const updateDistributor = await manager.decrement<Distributor>(
					Distributor,
					{ id: receipt.distributorId },
					'debt',
					receipt.debt
				)
				if (updateDistributor.affected !== 1) {
					throw new Error(`Payment Receipt ${receiptId} failed: Update distributor ${receipt.distributorId} invalid`)
				}

				const distributor = await manager.findOne(Distributor, {
					where: { oid, id: receipt.distributorId },
					select: { debt: true },
				})

				const distributorDebtDto = manager.create<DistributorDebt>(DistributorDebt, {
					oid,
					distributorId: receipt.distributorId,
					receiptId,
					type: DebtType.Refund,
					createTime: time,
					openDebt: distributor.debt + receipt.debt, // Trả lại số lượng ban đầu vì đã bị update trước đó
					money: -receipt.debt,
					closeDebt: distributor.debt,
				})
				await manager.insert(DistributorDebt, distributorDebtDto)
			}

			return { purchaseId, receiptId }
		})
	}

	// async recalculateProductQuantity(oid: number, purchaseId: number) {
	// 	await this.manager.query(`
	// 		UPDATE product 
	// 			LEFT JOIN ( SELECT product_id, SUM(quantity) as quantity FROM product_batch GROUP BY product_id ) sa 
	// 			ON product.id = sa.product_id
	// 		SET product.quantity = sa.quantity
	// 		WHERE product.id IN (SELECT DISTINCT product_id FROM product_in WHERE purchase_id = ${purchaseId}) 
	// 			AND product.oid = ${oid}
	// 	`)
	// }

	// async updateExpiryDateAndCostPriceProduct(oid: number, purchaseId: number) {
	// 	await this.manager.query(`
	// 		UPDATE product LEFT JOIN product_in ON product.id = product_in.product_id 
	// 		SET product.last_expiry_date = product_in.expiry_date, 
	// 			product.last_cost_price = product_in.cost_price,
	// 			product.last_retail_price = product_in.retail_price,
	// 			product.last_wholesale_price = product_in.wholesale_price
	// 		WHERE product_in.purchase_id = ${purchaseId} AND product_in.oid = ${oid}
	// 	`)
	// }
}
