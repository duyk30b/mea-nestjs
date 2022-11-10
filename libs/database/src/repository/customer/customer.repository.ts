import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { convertViToEn } from '_libs/common/helpers/string.helper'
import { NoExtraProperties } from '_libs/common/helpers/typescript.helper'
import { escapeSearch } from '_libs/database/common/base.dto'
import { FindOptionsWhere, In, Like, Repository, UpdateResult } from 'typeorm'
import { Customer } from '../../entities'
import { CustomerCriteria, CustomerOrder } from './customer.dto'

@Injectable()
export class CustomerRepository {
	constructor(@InjectRepository(Customer) private customerRepository: Repository<Customer>) { }

	getWhereOptions(criteria: CustomerCriteria) {
		const where: FindOptionsWhere<Customer> = {}

		if (criteria.oid != null) where.oid = criteria.oid
		if (criteria.id != null) where.id = criteria.id
		if (criteria.isActive != null) where.isActive = criteria.isActive

		if (criteria.ids) {
			if (criteria.ids.length === 0) criteria.ids.push(0)
			where.id = In(criteria.ids)
		}

		if (criteria.fullNameEn && Array.isArray(criteria.fullNameEn)) {
			if (criteria.fullNameEn[0] === 'LIKE' && criteria.fullNameEn[1]) {
				const text = escapeSearch(convertViToEn(criteria.fullNameEn[1]))
				where.fullNameEn = Like(`%${text}%`)
			}
		}
		if (criteria.phone && Array.isArray(criteria.phone)) {
			if (criteria.phone[0] === 'LIKE' && criteria.phone[1]) {
				where.phone = Like(`%${escapeSearch(criteria.phone[1])}%`)
			}
		}

		return where
	}

	async pagination(options: {
		page: number,
		limit: number,
		criteria?: CustomerCriteria,
		order?: CustomerOrder
	}) {
		const { limit, page, criteria, order } = options

		const [data, total] = await this.customerRepository.findAndCount({
			where: this.getWhereOptions(criteria),
			order,
			take: limit,
			skip: (page - 1) * limit,
		})

		return { total, page, limit, data }
	}

	async find(options: { limit?: number, criteria?: CustomerCriteria, order?: CustomerOrder }): Promise<Customer[]> {
		const { limit, criteria, order } = options
		return await this.customerRepository.find({
			where: this.getWhereOptions(criteria),
			order,
			take: limit,
		})
	}

	async findMany(criteria: CustomerCriteria): Promise<Customer[]> {
		return await this.customerRepository.find({ where: this.getWhereOptions(criteria) })
	}

	async findOne(criteria: CustomerCriteria, order?: CustomerOrder): Promise<Customer> {
		return await this.customerRepository.findOne({
			where: this.getWhereOptions(criteria),
			order,
		})
	}

	async insertOne<T extends Partial<Customer>>(dto: NoExtraProperties<Partial<Customer>, T>): Promise<Customer> {
		const customer = this.customerRepository.create(dto)
		return this.customerRepository.save(customer)
	}

	async update(criteria: CustomerCriteria, dto: Partial<Omit<Customer, 'id' | 'oid'>>): Promise<UpdateResult> {
		const where = this.getWhereOptions(criteria)
		return await this.customerRepository.update(where, dto)
	}
}
