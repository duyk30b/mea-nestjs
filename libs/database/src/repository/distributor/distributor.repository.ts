import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { convertViToEn } from '_libs/common/helpers/string.helper'
import { NoExtraProperties } from '_libs/common/helpers/typescript.helper'
import { escapeSearch } from '_libs/database/common/base.dto'
import { FindOptionsWhere, In, Like, Repository, UpdateResult } from 'typeorm'
import { Distributor } from '../../entities'
import { DistributorCondition, DistributorOrder } from './distributor.dto'

@Injectable()
export class DistributorRepository {
	constructor(@InjectRepository(Distributor) private distributorRepository: Repository<Distributor>) { }

	getWhereOptions(condition: DistributorCondition) {
		const where: FindOptionsWhere<Distributor> = {}

		if (condition.id != null) where.id = condition.id
		if (condition.oid != null) where.oid = condition.oid
		if (condition.isActive != null) where.isActive = condition.isActive

		if (condition.ids) {
			if (condition.ids.length === 0) condition.ids.push(0)
			where.id = In(condition.ids)
		}

		if (condition.fullName && Array.isArray(condition.fullName)) {
			if (condition.fullName[0] === 'LIKE' && condition.fullName[1]) {
				const text = escapeSearch(convertViToEn(condition.fullName[1]))
				where.fullName = Like(`%${text}%`)
			}
		}
		if (condition.phone && Array.isArray(condition.phone)) {
			if (condition.phone[0] === 'LIKE' && condition.phone[1]) {
				where.phone = Like(`%${escapeSearch(condition.phone[1])}%`)
			}
		}

		return where
	}

	async pagination<T extends Partial<DistributorOrder>>(options: {
		page: number,
		limit: number,
		condition?: DistributorCondition,
		order?: NoExtraProperties<DistributorOrder, T>
	}) {
		const { limit, page, condition, order } = options

		const [data, total] = await this.distributorRepository.findAndCount({
			where: this.getWhereOptions(condition),
			order,
			take: limit,
			skip: (page - 1) * limit,
		})

		return { total, page, limit, data }
	}

	async find(options: { limit: number, condition?: DistributorCondition, order?: DistributorOrder }): Promise<Distributor[]> {
		return await this.distributorRepository.find({
			where: this.getWhereOptions(options.condition),
			order: options.order,
			take: options.limit,
		})
	}

	async findMany(condition: DistributorCondition): Promise<Distributor[]> {
		return await this.distributorRepository.find({ where: this.getWhereOptions(condition) })
	}

	async findOne(condition: DistributorCondition): Promise<Distributor> {
		return await this.distributorRepository.findOne({ where: this.getWhereOptions(condition) })
	}

	async insertOne<T extends Partial<Distributor>>(dto: NoExtraProperties<Partial<Distributor>, T>): Promise<Distributor> {
		const distributor = this.distributorRepository.create(dto)
		return this.distributorRepository.save(distributor, { transaction: false })
	}

	async updateOne(condition: DistributorCondition, dto: Partial<Omit<Distributor, 'id' | 'oid'>>): Promise<UpdateResult> {
		const where = this.getWhereOptions(condition)
		return await this.distributorRepository.update(where, dto)
	}
}
