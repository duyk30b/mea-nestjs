import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { randomEnum, randomItemsInArray, randomNumber, shuffleArray } from '_libs/common/helpers/random.helper'
import { DiscountType, InvoiceItemType } from '_libs/database/common/variable'
import { Customer, Procedure, ProductBatch } from '_libs/database/entities'
import { ArrivalInvoiceRepository, InvoiceItemDto, InvoiceUpsertDto } from '_libs/database/repository'
import { Repository } from 'typeorm'

@Injectable()
export class ArrivalInvoiceSeed {
	constructor(
		@InjectRepository(ProductBatch) private productBatchRepository: Repository<ProductBatch>,
		@InjectRepository(Customer) private customerRepository: Repository<Customer>,
		@InjectRepository(Procedure) private procedureRepository: Repository<Procedure>,
		private readonly arrivalInvoiceRepository: ArrivalInvoiceRepository
	) { }

	fakeInvoiceUpsertDto(productBatches: ProductBatch[], procedures: Procedure[]): InvoiceUpsertDto {
		const numberProductBatch = randomNumber(2, 5)
		const numberProcedure = randomNumber(2, 5)

		const invoiceItemsDto: InvoiceItemDto[] = []

		for (let i = 0; i < numberProductBatch; i++) {
			const productBatch = productBatches[i]

			const productUnit = JSON.parse(productBatch.product.unit) as { name: string, rate: number }[]
			const unit = JSON.stringify(productUnit.find((i) => i.rate === 1))

			const expectedPrice = productBatch.retailPrice
			const discountPercent = randomNumber(10, 30)
			const discountMoney = Math.ceil(expectedPrice * discountPercent / 100 / 1000) * 1000
			const discountType = randomEnum<DiscountType>(DiscountType)
			const actualPrice = expectedPrice - discountMoney

			invoiceItemsDto.push({
				referenceId: productBatch.id,
				type: InvoiceItemType.ProductBatch,
				unit,
				costPrice: productBatch.costPrice,
				expectedPrice,
				quantity: randomNumber(1, 5),
				actualPrice,
				discountMoney,
				discountPercent,
				discountType,
			})
		}

		for (let i = 0; i < numberProcedure; i++) {
			const procedure = procedures[i]

			const expectedPrice = procedure.price
			const discountPercent = randomNumber(10, 30)
			const discountMoney = Math.ceil(expectedPrice * discountPercent / 100 / 1000) * 1000
			const discountType = randomEnum<DiscountType>(DiscountType)
			const actualPrice = expectedPrice - discountMoney

			invoiceItemsDto.push({
				referenceId: procedure.id,
				type: InvoiceItemType.Procedure,
				unit: JSON.stringify({ name: '', rate: 1 }),
				costPrice: 0,
				expectedPrice,
				quantity: randomNumber(1, 5),
				actualPrice,
				discountMoney,
				discountPercent,
				discountType,
			})
		}

		const totalCostMoney = invoiceItemsDto.reduce((acc, cur) => acc += cur.quantity * cur.costPrice, 0)
		const totalItemMoney = invoiceItemsDto.reduce((acc, cur) => acc += cur.quantity * cur.actualPrice, 0)

		const discountPercent = randomNumber(2, 10)
		const discountMoney = Math.ceil(totalItemMoney * discountPercent / 100 / 1000) * 1000
		const discountType = randomEnum<DiscountType>(DiscountType)
		const surcharge = randomNumber(10_000, 100_0000, 10_000)
		const expenses = randomNumber(5_000, 50_0000, 5_000)

		const totalMoney = totalItemMoney - discountMoney + surcharge
		const profit = totalMoney - totalCostMoney - expenses
		const debt = Math.floor(totalMoney * randomNumber(0.1, 0.5, 0.1) / 1000) * 1000

		const invoiceUpsertDto: InvoiceUpsertDto = {
			invoiceItems: invoiceItemsDto,
			totalCostMoney,
			totalItemMoney,
			discountMoney,
			discountPercent,
			discountType,
			surcharge,
			expenses,
			totalMoney,
			profit,
			debt,
			note: faker.lorem.sentence(),
		}

		return invoiceUpsertDto
	}

	async start(oid: number, number: number, startTime: Date, endTime: Date) {
		const productBatches = await this.productBatchRepository.find({
			relations: { product: true },
			relationLoadStrategy: 'join',
			where: { oid },
		})
		const procedures = await this.procedureRepository.findBy({ oid })
		const customers = await this.customerRepository.findBy({ oid })

		const gap = Math.ceil((endTime.getTime() - startTime.getTime()) / number)

		for (let i = 0; i < number; i++) {
			const customer = randomItemsInArray(customers)
			const productBatchesShuffle = shuffleArray(productBatches)
			const proceduresShuffle = shuffleArray(procedures)

			const createTime = startTime.getTime() + i * gap
			const paymentTime = startTime.getTime() + i * gap + 60 * 60 * 1000
			const refundTime = startTime.getTime() + i * gap + 2 * 60 * 60 * 1000

			const invoiceUpsertDto = this.fakeInvoiceUpsertDto(productBatchesShuffle, proceduresShuffle)
			const { invoiceId, arrivalId } = await this.arrivalInvoiceRepository.createInvoiceDraft({
				oid,
				customerId: customer.id,
				invoiceUpsertDto,
				time: createTime,
			})

			if (i % 2 === 0) {
				const invoice = await this.arrivalInvoiceRepository.paymentInvoiceDraft({ oid, invoiceId, time: paymentTime })
				if (i % 4 === 0) {
					await this.arrivalInvoiceRepository.refundInvoice({ oid, invoiceId, time: refundTime })
					if (i % 8 === 0) {
						const invoiceInsertAfterRefundDto = this.fakeInvoiceUpsertDto(productBatchesShuffle, proceduresShuffle)
						await this.arrivalInvoiceRepository.createInvoiceDraftAfterRefund({
							oid,
							arrivalId,
							invoiceUpsertDto: invoiceInsertAfterRefundDto,
						})
					}
				}
			}

			// const createMultiDraft = await Promise.allSettled(Array.from(Array(300)).map((i, index) => {
			// 	const dto = JSON.parse(JSON.stringify(invoiceUpsertDto))
			// 	const r = randomNumber(1, 1000, 1)
			// 	dto.totalMoney = r
			// 	dto.invoiceItems.forEach((item) => item.quantity = r)
			// 	return this.arrivalInvoiceRepository.createInvoiceDraft(oid, dto, createTime)
			// }))
			// console.log('🚀 ~ file: purchase.seed.ts:83 ~ PurchaseSeed ~ start ~ createMultiDraft:', createMultiDraft)

			// const updateMultiDraft = await Promise.allSettled(Array.from(Array(200)).map((i, index) => {
			// 	const dto = JSON.parse(JSON.stringify(invoiceUpsertDto))
			// 	const r = 10 + index
			// 	dto.totalMoney = r
			// 	dto.invoiceItems.forEach((item) => item.quantity = r)
			// 	return this.arrivalInvoiceRepository.updateInvoiceDraft(oid, 201, dto)
			// }))
			// console.log('🚀 ~ file: purchase.seed.ts:83 ~ PurchaseSeed ~ start ~ draft:', updateMultiDraft)

			// const paymentMultiDraft = await Promise.allSettled(Array.from(Array(5)).map((i, index) => {
			// 	return this.arrivalInvoiceRepository.paymentInvoiceDraft(oid, 3, 1234123)
			// }))
			// console.log('🚀 ~ file: purchase.seed.ts:83 ~ PurchaseSeed ~ start ~ draft:', paymentMultiDraft)

			// const refundMultiDraft = await Promise.allSettled(Array.from(Array(20)).map((i, index) => {
			// 	return this.arrivalInvoiceRepository.refundInvoice(oid, 20, 1234123)
			// }))
			// console.log('🚀 ~ file: purchase.seed.ts:83 ~ PurchaseSeed ~ start ~ draft:', refundMultiDraft)
		}
	}
}
