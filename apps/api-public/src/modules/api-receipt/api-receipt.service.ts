import { Injectable } from '@nestjs/common'
import { uniqueArray } from '_libs/common/helpers/object.helper'
import { DistributorRepository, ReceiptRepository } from '_libs/database/repository'
import { ReceiptGetOneQuery, ReceiptPaginationQuery } from './request'

@Injectable()
export class ApiReceiptService {
	constructor(
		private readonly receiptRepository: ReceiptRepository,
		private readonly distributorRepository: DistributorRepository
	) { }

	async pagination(oid: number, query: ReceiptPaginationQuery) {
		const { page, limit, total, data } = await this.receiptRepository.pagination({
			page: query.page,
			limit: query.limit,
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

	async getOne(oid: number, id: number, { relations }: ReceiptGetOneQuery) {
		return await this.receiptRepository.findOne({ oid, id }, {
			distributor: !!relations?.distributor,
			receiptItems: !!relations?.receiptItems,
		})
	}

	async queryOne(oid: number, id: number, { relations }: ReceiptGetOneQuery) {
		return await this.receiptRepository.queryOneBy({ oid, id }, {
			distributor: !!relations?.distributor,
			receiptItems: !!relations?.receiptItems && { productBatch: true },
		})
	}
}
