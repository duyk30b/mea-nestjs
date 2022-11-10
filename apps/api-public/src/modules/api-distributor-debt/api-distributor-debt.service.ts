import { Injectable } from '@nestjs/common'
import { DistributorDebtRepository } from '_libs/database/repository'
import { DistributorDebtPaginationQuery, DistributorDebtPaymentBody } from './request'

@Injectable()
export class ApiDistributorDebtService {
	constructor(private readonly distributorDebtRepository: DistributorDebtRepository) { }

	async pagination(oid: number, query: DistributorDebtPaginationQuery) {
		return await this.distributorDebtRepository.pagination({
			page: query.page,
			limit: query.limit,
			criteria: { distributorId: query.filter?.distributorId },
			order: query.sort || { id: 'DESC' },
		})
	}

	async startPayDebt(oid: number, body: DistributorDebtPaymentBody) {
		const { distributor, distributorDebt } = await this.distributorDebtRepository.startPayDebt({
			oid,
			distributorId: body.distributorId,
			money: body.money,
			createTime: Date.now(),
			note: body.note,
		})
		return { distributor, distributorDebt }
	}
}
