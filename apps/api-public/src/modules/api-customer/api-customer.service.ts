import { Injectable } from '@nestjs/common'
import { BusinessException } from '_libs/common/exception-filter/business-exception.filter'
import { CustomerRepository } from '_libs/database/repository'
import {
	CustomerCreateBody, CustomerGetManyQuery,
	CustomerGetOneQuery, CustomerPaginationQuery, CustomerUpdateBody,
} from './request'

@Injectable()
export class ApiCustomerService {
	constructor(private readonly customerRepository: CustomerRepository) { }

	async pagination(oid: number, query: CustomerPaginationQuery) {
		return await this.customerRepository.pagination({
			page: query.page,
			limit: query.limit,
			condition: {
				oid,
				isActive: query.filter?.isActive,
				fullName: ['LIKE', query.filter?.fullName],
				phone: ['LIKE', query.filter?.phone],
			},
			order: query.sort || { id: 'DESC' },
		})
	}

	async getMany(oid: number, query: CustomerGetManyQuery) {
		return await this.customerRepository.find({
			condition: {
				oid,
				isActive: query.filter?.isActive,
				fullName: ['LIKE', query.filter?.fullName],
				phone: ['LIKE', query.filter?.phone],
			},
			limit: query.limit,
		})
	}

	async getOne(oid: number, id: number, query?: CustomerGetOneQuery) {
		const customer = await this.customerRepository.findOne({ oid, id })
		if (!customer) throw new BusinessException('common.Customer.NotExist')
		return customer
	}

	async createOne(oid: number, body: CustomerCreateBody) {
		return await this.customerRepository.insertOne({ oid, ...body })
	}

	async updateOne(oid: number, id: number, body: CustomerUpdateBody) {
		const { affected } = await this.customerRepository.update({ id, oid }, body)
		if (affected !== 1) throw new Error('Database.UpdateFailed')
		return await this.customerRepository.findOne({ id, oid })
	}
}
