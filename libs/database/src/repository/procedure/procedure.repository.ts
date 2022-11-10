import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { convertViToEn } from '_libs/common/helpers/string.helper'
import { NoExtraProperties } from '_libs/common/helpers/typescript.helper'
import { escapeSearch } from '_libs/database/common/base.dto'
import { FindOptionsWhere, In, Like, Repository, UpdateResult } from 'typeorm'
import { Procedure } from '../../entities'
import { ProcedureCriteria, ProcedureOrder } from './procedure.dto'

@Injectable()
export class ProcedureRepository {
	constructor(@InjectRepository(Procedure) private procedureRepository: Repository<Procedure>) { }

	getWhereOptions(criteria: ProcedureCriteria = {}) {
		const where: FindOptionsWhere<Procedure> = {}

		if (criteria.id != null) where.id = criteria.id
		if (criteria.oid != null) where.oid = criteria.oid
		if (criteria.group != null) where.group = criteria.group
		if (criteria.isActive != null) where.isActive = criteria.isActive

		if (criteria.ids) {
			if (criteria.ids.length === 0) criteria.ids.push(0)
			where.id = In(criteria.ids)
		}

		if (criteria.searchText) {
			const text = escapeSearch(convertViToEn(criteria.searchText))
			where.nameEn = Like(`%${text}%`)
		}

		return where
	}

	async pagination(options: { page: number, limit: number, criteria?: ProcedureCriteria, order?: ProcedureOrder }) {
		const { limit, page, criteria, order } = options

		const [data, total] = await this.procedureRepository.findAndCount({
			where: this.getWhereOptions(criteria),
			order,
			take: limit,
			skip: (page - 1) * limit,
		})
		const totalPage = Math.ceil(total / limit)

		return { total, page, limit, data, totalPage }
	}

	async find(options: { criteria?: ProcedureCriteria, order?: ProcedureOrder, limit?: number }): Promise<Procedure[]> {
		const { limit, criteria, order } = options

		return await this.procedureRepository.find({
			where: this.getWhereOptions(criteria),
			order,
			take: limit,
		})
	}

	async findMany(criteria: ProcedureCriteria): Promise<Procedure[]> {
		const where = this.getWhereOptions(criteria)
		return await this.procedureRepository.find({ where })
	}

	async findOne(criteria: ProcedureCriteria): Promise<Procedure> {
		const where = this.getWhereOptions(criteria)
		return await this.procedureRepository.findOne({ where })
	}

	async insertOne<T extends Partial<Procedure>>(dto: NoExtraProperties<Partial<Procedure>, T>): Promise<Procedure> {
		const customer = this.procedureRepository.create(dto)
		return this.procedureRepository.save(customer)
	}

	async update(criteria: ProcedureCriteria, dto: Partial<Omit<Procedure, 'id' | 'oid'>>): Promise<UpdateResult> {
		const where = this.getWhereOptions(criteria)
		return await this.procedureRepository.update(where, dto)
	}
}
