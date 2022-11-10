import { Injectable } from '@nestjs/common'
import { uniqueArray } from '_libs/common/helpers/object.helper'
import { DistributorRepository, PurchaseReceiptRepository, PurchaseRepository, ReceiptInsertDto, ReceiptUpdateDto } from '_libs/database/repository'
import { PurchaseGetOneQuery, PurchasePaginationQuery, ReceiptCreateBody, ReceiptUpdateBody } from './request'

@Injectable()
export class ApiPurchaseService {
	constructor(
		private readonly purchaseRepository: PurchaseRepository,
		private readonly purchaseReceiptRepository: PurchaseReceiptRepository,
		private readonly distributorRepository: DistributorRepository
	) { }

	async pagination(oid: number, query: PurchasePaginationQuery) {
		const { page, limit, total, data } = await this.purchaseRepository.pagination({
			limit: query.limit,
			page: query.page,
			criteria: {
				oid,
				distributorId: query.filter?.distributorId,
				fromTime: query.filter?.fromTime,
				toTime: query.filter?.toTime,
				paymentStatus: query.filter?.paymentStatus,
			},
			order: query.sort || { id: 'DESC' },
		})

		if (query.relations?.distributor && data.length) {
			const distributorIds = uniqueArray(data.map((i) => i.distributorId))
			const distributors = await this.distributorRepository.findMany({ ids: distributorIds })
			data.forEach((i) => i.distributor = distributors.find((j) => j.id === i.distributorId))
		}

		return { page, limit, total, data }
	}

	async getOne(oid: number, id: number, query?: PurchaseGetOneQuery) {
		return await this.purchaseRepository.findOne({ oid, id }, {
			distributor: !!query?.relations?.distributor,
			receipts: !!query?.relations?.receipts,
		})
	}

	async createReceiptDraft(oid: number, body: ReceiptCreateBody) {
		try {
			const receiptDto = ReceiptInsertDto.from(body)
			const data = await this.purchaseReceiptRepository.createReceiptDraft(oid, receiptDto, Date.now())
			return { success: true, data }
		} catch (error: any) {
			return { success: false, message: error.message }
		}
	}

	async createReceiptDraftAfterRefund(oid: number, purchaseId: number, body: ReceiptCreateBody) {
		try {
			const receiptDto = ReceiptInsertDto.from(body)
			const data = await this.purchaseReceiptRepository.createReceiptDraftAfterRefund(oid, purchaseId, receiptDto)
			return { success: true, data }
		} catch (error: any) {
			return { success: false, message: error.message }
		}
	}

	async updateReceiptDraft(oid: number, receiptId: number, body: ReceiptUpdateBody) {
		try {
			const receiptDto = ReceiptUpdateDto.from(body)
			const data = await this.purchaseReceiptRepository.updateReceiptDraft(oid, receiptId, receiptDto)
			return { success: true, data }
		} catch (error: any) {
			return { success: false, message: error.message }
		}
	}

	async paymentReceiptDraft(oid: number, receiptId: number) {
		try {
			const data = await this.purchaseReceiptRepository.paymentReceiptDraft(oid, receiptId, Date.now())
			return { success: true, data }
		} catch (error: any) {
			return { success: false, message: error.message }
		}
	}

	async refundReceipt(oid: number, receiptId: number) {
		try {
			const data = await this.purchaseReceiptRepository.refundReceipt(oid, receiptId, Date.now())
			return { success: true, data }
		} catch (error: any) {
			return { success: false, message: error.message }
		}
	}
}
