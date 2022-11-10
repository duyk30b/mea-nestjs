import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { randomEnum, randomItemsInArray, randomNumber, shuffleArray } from '_libs/common/helpers/random.helper'
import { DiscountType } from '_libs/database/common/variable'
import { Distributor, ProductBatch } from '_libs/database/entities'
import { PurchaseReceiptRepository, ReceiptInsertDto, ReceiptItemDto } from '_libs/database/repository'
import { Repository } from 'typeorm'

@Injectable()
export class PurchaseSeed {
	constructor(
		@InjectRepository(ProductBatch) private productBatchRepository: Repository<ProductBatch>,
		@InjectRepository(Distributor) private distributorRepository: Repository<Distributor>,
		private readonly purchaseReceiptRepository: PurchaseReceiptRepository
	) { }

	fakeReceiptInsertDto(productBatches: ProductBatch[], distributor: Distributor): ReceiptInsertDto {
		const numberStock = randomNumber(10, 20)

		const receiptItemsDto: ReceiptItemDto[] = []
		for (let i = 0; i < numberStock; i++) {
			const productBatch = productBatches[i]
			const productUnit = JSON.parse(productBatch.product.unit) as { name: string, rate: number }[]
			const unit = JSON.stringify(productUnit.find((i) => i.rate === 1))

			receiptItemsDto.push({
				productBatchId: productBatch.id,
				quantity: randomNumber(20, 50, 5),
				unit,
				productBatch,
			})
		}

		const totalItemMoney = receiptItemsDto.reduce((acc, cur) => {
			return acc + cur.quantity * cur.productBatch.costPrice
		}, 0)
		const discountPercent = randomNumber(10, 30)
		const discountMoney = Math.ceil(totalItemMoney * discountPercent / 100 / 1000) * 1000
		const discountType = randomEnum<DiscountType>(DiscountType)
		const surcharge = randomNumber(50_000, 20_0000, 1000)
		const totalMoney = totalItemMoney - discountMoney + surcharge
		const debt = randomNumber(10_000, 200_000, 10_000)

		const receiptInsertDto: ReceiptInsertDto = {
			distributorId: distributor.id,
			totalItemMoney,
			discountMoney,
			discountPercent,
			discountType,
			surcharge,
			totalMoney,
			debt,
			receiptItems: receiptItemsDto,
		}

		return receiptInsertDto
	}

	async start(oid: number, number: number) {
		const productBatches = await this.productBatchRepository.find({
			relations: { product: true },
			relationLoadStrategy: 'join',
			where: { oid },
		})
		const distributors = await this.distributorRepository.findBy({ oid })

		const firstTime = new Date('2020-06-07')

		for (let i = 0; i < number; i++) {
			const distributor = randomItemsInArray(distributors)
			const productBatchesShuffle = shuffleArray(productBatches)
			const createTime = firstTime.getTime() + i * 3 * 24 * 60 * 60 * 1000 // 3 ngày nhập 1 đơn
			const paymentTime = firstTime.getTime() + i * 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000
			const refundTime = firstTime.getTime() + i * 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000

			const receiptInsertDto = this.fakeReceiptInsertDto(productBatchesShuffle, distributor)
			const { receiptId, purchaseId } = await this.purchaseReceiptRepository.createReceiptDraft(oid, receiptInsertDto, createTime)

			if (i % 2 === 0) {
				await this.purchaseReceiptRepository.paymentReceiptDraft(oid, receiptId, paymentTime)
				if (i % 4 === 0) {
					await this.purchaseReceiptRepository.refundReceipt(oid, receiptId, refundTime)
					if (i % 8 === 0) {
						const receiptInsertAfterRefundDto = this.fakeReceiptInsertDto(productBatchesShuffle, distributor)
						await this.purchaseReceiptRepository.createReceiptDraftAfterRefund(oid, purchaseId, receiptInsertAfterRefundDto)
					}
				}
			}

			// const createMultiDraft = await Promise.allSettled(Array.from(Array(100)).map((i, index) => {
			// 	const dto = JSON.parse(JSON.stringify(receiptInsertDto))
			// 	const r = randomNumber(1, 1000, 1)
			// 	dto.totalMoney = r
			// 	dto.receiptItems.forEach((item) => item.quantity = r)
			// 	return this.purchaseReceiptRepository.createReceiptDraft(oid, dto, createTime)
			// }))
			// console.log('🚀 ~ file: purchase.seed.ts:83 ~ PurchaseSeed ~ start ~ createMultiDraft:', createMultiDraft)

			// const updateMultiDraft = await Promise.allSettled(Array.from(Array(50)).map((i, index) => {
			// 	const dto = JSON.parse(JSON.stringify(receiptInsertDto))
			// 	const r = 10 + index
			// 	dto.totalMoney = r
			// 	dto.receiptItems.forEach((item) => item.quantity = r)
			// 	return this.purchaseReceiptRepository.updateReceiptDraft(oid, 10, dto)
			// }))
			// console.log('🚀 ~ file: purchase.seed.ts:83 ~ PurchaseSeed ~ start ~ draft:', updateMultiDraft)

			// const paymentMultiDraft = await Promise.allSettled(Array.from(Array(20)).map((i, index) => {
			// 	return this.purchaseReceiptRepository.paymentReceiptDraft(oid, 17, 1234123)
			// }))
			// console.log('🚀 ~ file: purchase.seed.ts:83 ~ PurchaseSeed ~ start ~ draft:', paymentMultiDraft)

			// const refundMultiDraft = await Promise.allSettled(Array.from(Array(20)).map((i, index) => {
			// 	return this.purchaseReceiptRepository.refundReceipt(oid, 14, 1234123)
			// }))
			// console.log('🚀 ~ file: purchase.seed.ts:83 ~ PurchaseSeed ~ start ~ draft:', refundMultiDraft)
		}
	}
}
