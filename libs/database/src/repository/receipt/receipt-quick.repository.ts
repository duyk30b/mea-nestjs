import { Injectable } from '@nestjs/common/decorators'
import { InjectEntityManager } from '@nestjs/typeorm'
import { uniqueArray } from '_libs/common/helpers/object.helper'
import { DebtType, ProductMovementType, ReceiptStatus } from '_libs/database/common/variable'
import { Distributor, DistributorDebt, ProductBatch, ProductMovement, Receipt, ReceiptItem } from '_libs/database/entities'
import { DataSource, EntityManager, In, IsNull } from 'typeorm'
import { ProductRepository } from '../product/product.repository'
import { ReceiptInsertDto, ReceiptUpdateDto } from './receipt.dto'

@Injectable()
export class ReceiptQuickRepository {
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

	async deleteDraft(params: { oid: number, receiptId: number }) {
		const { oid, receiptId } = params
		return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
			const receiptDeleteResult = await manager.delete(Receipt, {
				oid,
				id: receiptId,
				status: ReceiptStatus.Draft,
			})
			if (receiptDeleteResult.affected !== 1) {
				throw new Error(`Delete Invoice ${receiptId} failed: Status invalid`)
			}
			await manager.delete(ReceiptItem, { oid, receiptId })
		})
	}

	async startShipAndPayment(params: { oid: number, receiptId: number, shipTime: number }) {
		const { oid, receiptId, shipTime } = params

		const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
			const receiptUpdateResult = await manager.update(Receipt, {
				id: receiptId,
				oid,
				shipTime: IsNull(),
				paymentTime: IsNull(),
				status: In([ReceiptStatus.Draft, ReceiptStatus.Process]),
			}, {
				status: ReceiptStatus.Finish,
				paymentTime: shipTime,
				shipTime,
			})
			if (receiptUpdateResult.affected !== 1) {
				throw new Error(`Process Receipt ${receiptId} failed: Status invalid`)
			}

			const [receipt] = await manager.find(Receipt, {
				relations: { receiptItems: true },
				relationLoadStrategy: 'join',
				where: { oid, id: receiptId },
			})
			if (receipt.receiptItems.length === 0) {
				throw new Error(`Process Receipt ${receiptId} failed: Not found receipt_items`)
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
						createTime: shipTime,
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
					throw new Error(`Process Receipt ${receiptId} failed: Update distributor ${receipt.distributorId} invalid`)
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
					createTime: shipTime,
					openDebt: distributor.debt - receipt.debt, // do đã bị update ở trên
					money: receipt.debt,
					closeDebt: distributor.debt,
				})
				await manager.insert(DistributorDebt, distributorDebtDto)
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

	async startRefund(params: { oid: number, receiptId: number, refundTime: number }) {
		const { oid, receiptId, refundTime } = params
		const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
			const { affected } = await manager.update(Receipt, {
				id: receiptId,
				oid,
				status: ReceiptStatus.Finish,
			}, {
				refundTime,
				status: ReceiptStatus.Refund,
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
						createTime: refundTime,
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
					createTime: refundTime,
					openDebt: distributor.debt + receipt.debt, // Trả lại số lượng ban đầu vì đã bị update trước đó
					money: -receipt.debt,
					closeDebt: distributor.debt,
				})
				await manager.insert(DistributorDebt, distributorDebtDto)
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
