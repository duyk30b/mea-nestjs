import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { uniqueArray } from '_libs/common/helpers/object.helper'
import { DistributorRepository, ReceiptInsertDto, ReceiptQuickRepository, ReceiptRepository, ReceiptUpdateDto } from '_libs/database/repository'
import { ReceiptCreateBody, ReceiptGetOneQuery, ReceiptPaginationQuery, ReceiptUpdateBody } from './request'

@Injectable()
export class ApiReceiptService {
	constructor(
		private readonly receiptRepository: ReceiptRepository,
		private readonly receiptQuickRepository: ReceiptQuickRepository,
		private readonly distributorRepository: DistributorRepository
	) { }

	async pagination(oid: number, query: ReceiptPaginationQuery) {
		const { page, limit, total, data } = await this.receiptRepository.pagination({
			page: query.page,
			limit: query.limit,
			condition: {
				oid,
				distributorId: query.filter?.distributorId,
				fromTime: query.filter?.fromTime,
				toTime: query.filter?.toTime,
				status: query.filter?.status,
			},
			order: query.sort || { id: 'DESC' },
		})

		if (query.relation?.distributor && data.length) {
			const distributorIds = uniqueArray(data.map((i) => i.distributorId))
			const distributors = await this.distributorRepository.findMany({ ids: distributorIds })
			data.forEach((i) => i.distributor = distributors.find((j) => j.id === i.distributorId))
		}
		return { page, limit, total, data }
	}

	async getOne(oid: number, id: number, { relation }: ReceiptGetOneQuery) {
		return await this.receiptRepository.findOne({ oid, id }, {
			distributor: !!relation?.distributor,
			receiptItems: !!relation?.receiptItems,
		})
	}

	async queryOne(oid: number, id: number, { relation }: ReceiptGetOneQuery) {
		return await this.receiptRepository.queryOneBy({ oid, id }, {
			distributor: !!relation?.distributor,
			receiptItems: !!relation?.receiptItems && { productBatch: true },
		})
	}

	async createDraft(params: { oid: number, body: ReceiptCreateBody }) {
		const { oid, body } = params
		try {
			return await this.receiptQuickRepository.createDraft({
				oid,
				receiptInsertDto: ReceiptInsertDto.from(body),
			})
		} catch (error: any) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
		}
	}

	async updateDraft(params: { oid: number, receiptId: number, body: ReceiptUpdateBody }) {
		const { oid, receiptId, body } = params
		try {
			return await this.receiptQuickRepository.updateDraft({
				oid,
				receiptId,
				receiptUpdateDto: ReceiptUpdateDto.from(body),
			})
		} catch (error: any) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
		}
	}

	async deleteDraft(params: { oid: number, receiptId: number }) {
		const { oid, receiptId } = params
		try {
			await this.receiptQuickRepository.deleteDraft({ oid, receiptId })
			return { success: true }
		} catch (error: any) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
		}
	}

	async startShipAndPayment(params: { oid: number, receiptId: number, shipTime: number }) {
		const { oid, receiptId, shipTime } = params
		try {
			await this.receiptQuickRepository.startShipAndPayment({ oid, receiptId, shipTime })
			return { success: true }
		} catch (error: any) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
		}
	}

	async startRefund(params: { oid: number, receiptId: number, refundTime: number }) {
		const { oid, receiptId, refundTime } = params
		try {
			await this.receiptQuickRepository.startRefund({ oid, receiptId, refundTime })
			return { success: true }
		} catch (error: any) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
		}
	}
}
