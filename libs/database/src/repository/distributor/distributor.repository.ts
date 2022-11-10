import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { convertViToEn } from '_libs/common/helpers/string.helper'
import { NoExtraProperties } from '_libs/common/helpers/typescript.helper'
import { escapeSearch } from '_libs/database/common/base.dto'
import { FindOptionsWhere, In, Like, Repository, UpdateResult } from 'typeorm'
import { Distributor } from '../../entities'
import { DistributorCriteria, DistributorOrder } from './distributor.dto'

@Injectable()
export class DistributorRepository {
	constructor(@InjectRepository(Distributor) private distributorRepository: Repository<Distributor>) { }

	getWhereOptions(criteria: DistributorCriteria) {
		const where: FindOptionsWhere<Distributor> = {}

		if (criteria.id != null) where.id = criteria.id
		if (criteria.oid != null) where.oid = criteria.oid
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

	async pagination<T extends Partial<DistributorOrder>>(options: {
		page: number,
		limit: number,
		criteria?: DistributorCriteria,
		order?: NoExtraProperties<DistributorOrder, T>
	}) {
		const { limit, page, criteria, order } = options

		const [data, total] = await this.distributorRepository.findAndCount({
			where: this.getWhereOptions(criteria),
			order,
			take: limit,
			skip: (page - 1) * limit,
		})

		return { total, page, limit, data }
	}

	async find(options: { limit: number, criteria?: DistributorCriteria, order?: DistributorOrder }): Promise<Distributor[]> {
		return await this.distributorRepository.find({
			where: this.getWhereOptions(options.criteria),
			order: options.order,
			take: options.limit,
		})
	}

	async findMany(criteria: DistributorCriteria): Promise<Distributor[]> {
		return await this.distributorRepository.find({ where: this.getWhereOptions(criteria) })
	}

	async findOne(criteria: DistributorCriteria): Promise<Distributor> {
		return await this.distributorRepository.findOne({ where: this.getWhereOptions(criteria) })
	}

	async insertOne<T extends Partial<Distributor>>(dto: NoExtraProperties<Partial<Distributor>, T>): Promise<Distributor> {
		const distributor = this.distributorRepository.create(dto)
		return this.distributorRepository.save(distributor, { transaction: false })
	}

	async updateOne(criteria: DistributorCriteria, dto: Partial<Omit<Distributor, 'id' | 'oid'>>): Promise<UpdateResult> {
		const where = this.getWhereOptions(criteria)
		return await this.distributorRepository.update(where, dto)
	}
}
