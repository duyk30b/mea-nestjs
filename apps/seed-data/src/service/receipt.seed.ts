import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { randomEnum, randomItemsInArray, randomNumber, shuffleArray } from '_libs/common/helpers/random.helper'
import { DiscountType } from '_libs/database/common/variable'
import { Distributor, ProductBatch } from '_libs/database/entities'
import { ReceiptInsertDto, ReceiptItemDto, ReceiptQuickRepository } from '_libs/database/repository'
import { Repository } from 'typeorm'

@Injectable()
export class ReceiptSeed {
	constructor(
		@InjectRepository(ProductBatch) private productBatchRepository: Repository<ProductBatch>,
		@InjectRepository(Distributor) private distributorRepository: Repository<Distributor>,
		private readonly receiptQuickRepository: ReceiptQuickRepository
	) { }

	fakeReceiptInsertDto(productBatches: ProductBatch[]): ReceiptInsertDto {
		const numberStock = randomNumber(10, 20)

		const receiptItemsDto: ReceiptItemDto[] = []
		for (let i = 0; i < numberStock; i++) {
			const productBatch = productBatches[i]
			const unit = productBatch.product.unit.find((i) => i.rate === 1)

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
			const shipTime = firstTime.getTime() + i * 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000
			const refundTime = firstTime.getTime() + i * 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000

			const receiptInsertDto = this.fakeReceiptInsertDto(productBatchesShuffle)
			receiptInsertDto.distributorId = distributor.id
			receiptInsertDto.createTime = createTime

			const { receiptId } = await this.receiptQuickRepository.createDraft({ oid, receiptInsertDto })

			if (i % 2 === 0) {
				await this.receiptQuickRepository.startShipAndPayment({ oid, receiptId, shipTime })
				if (i % 4 === 0) {
					await this.receiptQuickRepository.startRefund({ oid, receiptId, refundTime })
				}
			}

			// const createMultiDraft = await Promise.allSettled(Array.from(Array(100)).map((i, index) => {
			// 	const dto = JSON.parse(JSON.stringify(receiptInsertDto))
			// 	const r = randomNumber(1, 1000, 1)
			// 	dto.totalMoney = r
			// 	dto.receiptItems.forEach((item) => item.quantity = r)
			// 	return this.receiptQuickRepository.createReceiptDraft(oid, dto, createTime)
			// }))
			// console.log('🚀 ~ file: purchase.seed.ts:83 ~ PurchaseSeed ~ start ~ createMultiDraft:', createMultiDraft)

			// const updateMultiDraft = await Promise.allSettled(Array.from(Array(50)).map((i, index) => {
			// 	const dto = JSON.parse(JSON.stringify(receiptInsertDto))
			// 	const r = 10 + index
			// 	dto.totalMoney = r
			// 	dto.receiptItems.forEach((item) => item.quantity = r)
			// 	return this.receiptQuickRepository.updateReceiptDraft(oid, 10, dto)
			// }))
			// console.log('🚀 ~ file: purchase.seed.ts:83 ~ PurchaseSeed ~ start ~ draft:', updateMultiDraft)

			// const paymentMultiDraft = await Promise.allSettled(Array.from(Array(20)).map((i, index) => {
			// 	return this.receiptQuickRepository.paymentReceiptDraft(oid, 17, 1234123)
			// }))
			// console.log('🚀 ~ file: purchase.seed.ts:83 ~ PurchaseSeed ~ start ~ draft:', paymentMultiDraft)

			// const refundMultiDraft = await Promise.allSettled(Array.from(Array(20)).map((i, index) => {
			// 	return this.receiptQuickRepository.refundReceipt(oid, 14, 1234123)
			// }))
			// console.log('🚀 ~ file: purchase.seed.ts:83 ~ PurchaseSeed ~ start ~ draft:', refundMultiDraft)
		}
	}
}