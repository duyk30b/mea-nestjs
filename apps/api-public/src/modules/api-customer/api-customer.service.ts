import { Injectable } from '@nestjs/common'
import { CustomerRepository } from '_libs/database/repository'
import { BusinessException } from '../../exception-filters/business-exception.filter'
import { ErrorMessage } from '../../exception-filters/exception.const'
import { CustomerCreateBody, CustomerGetManyQuery, CustomerGetOneQuery, CustomerPaginationQuery, CustomerUpdateBody } from './request'

@Injectable()
export class ApiCustomerService {
	constructor(private readonly customerRepository: CustomerRepository) { }

	async pagination(oid: number, query: CustomerPaginationQuery) {
		return await this.customerRepository.pagination({
			page: query.page,
			limit: query.limit,
			criteria: {
				oid,
				isActive: query.filter?.isActive,
				fullNameEn: ['LIKE', query.filter?.fullNameEn],
				phone: ['LIKE', query.filter?.phone],
			},
			order: query.sort || { id: 'DESC' },
		})
	}

	async getMany(oid: number, { limit, filter }: CustomerGetManyQuery) {
		return await this.customerRepository.find({
			criteria: {
				oid,
				fullNameEn: ['LIKE', filter?.fullNameEn],
				phone: ['LIKE', filter?.phone],
			},
			limit,
		})
	}

	async getOne(oid: number, id: number, query?: CustomerGetOneQuery) {
		const customer = await this.customerRepository.findOne({ oid, id })
		if (!customer) throw new BusinessException(ErrorMessage.Customer.NotFound)
		return customer
	}

	async createOne(oid: number, body: CustomerCreateBody) {
		return await this.customerRepository.insertOne({ oid, ...body })
	}

	async updateOne(oid: number, id: number, body: CustomerUpdateBody) {
		const { affected } = await this.customerRepository.update({ id, oid }, body)
		if (affected !== 1) throw new Error(ErrorMessage.Database.UpdateFailed)
		return await this.customerRepository.findOne({ id, oid })
	}
}
