import { Injectable } from '@nestjs/common'
import { CustomerDebtRepository } from '_libs/database/repository'
import { CustomerDebtPaginationQuery, CustomerDebtPaymentBody } from './request'

@Injectable()
export class ApiCustomerDebtService {
	constructor(private readonly customerDebtRepository: CustomerDebtRepository) { }

	async pagination(oid: number, query: CustomerDebtPaginationQuery) {
		return await this.customerDebtRepository.pagination({
			page: query.page,
			limit: query.limit,
			criteria: {
				oid,
				customerId: query.filter?.customerId,
			},
			order: query.sort || { id: 'DESC' },
		})
	}

	async startPayDebt(oid: number, body: CustomerDebtPaymentBody) {
		const { customer, customerDebt } = await this.customerDebtRepository.startPayDebt({
			oid,
			customerId: body.customerId,
			money: body.money,
			createTime: Date.now(),
			note: body.note,
		})
		return { customer, customerDebt }
	}
}
