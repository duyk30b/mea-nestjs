import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, In, Like, Repository, UpdateResult } from 'typeorm'
import { convertViToEn } from '../../../common/helpers/string.helper'
import { NoExtraProperties } from '../../../common/helpers/typescript.helper'
import { escapeSearch } from '../../common/base.dto'
import { Procedure } from '../../entities'
import { ProcedureCondition, ProcedureOrder } from './procedure.dto'

@Injectable()
export class ProcedureRepository {
    constructor(@InjectRepository(Procedure) private procedureRepository: Repository<Procedure>) {}

    getWhereOptions(condition: ProcedureCondition = {}) {
        const where: FindOptionsWhere<Procedure> = {}

        if (condition.id != null) where.id = condition.id
        if (condition.oid != null) where.oid = condition.oid
        if (condition.group != null) where.group = condition.group
        if (condition.isActive != null) where.isActive = condition.isActive

        if (condition.ids) {
            if (condition.ids.length === 0) condition.ids.push(0)
            where.id = In(condition.ids)
        }

        if (condition.searchText) {
            const text = escapeSearch(convertViToEn(condition.searchText))
            where.name = Like(`%${text}%`)
        }

        return where
    }

    async pagination(options: { page: number; limit: number; condition?: ProcedureCondition; order?: ProcedureOrder }) {
        const { limit, page, condition, order } = options

        const [data, total] = await this.procedureRepository.findAndCount({
            where: this.getWhereOptions(condition),
            order,
            take: limit,
            skip: (page - 1) * limit,
        })
        const totalPage = Math.ceil(total / limit)

        return { total, page, limit, data, totalPage }
    }

    async find(options: {
        condition?: ProcedureCondition
        order?: ProcedureOrder
        limit?: number
    }): Promise<Procedure[]> {
        const { limit, condition, order } = options

        return await this.procedureRepository.find({
            where: this.getWhereOptions(condition),
            order,
            take: limit,
        })
    }

    async findMany(condition: ProcedureCondition): Promise<Procedure[]> {
        const where = this.getWhereOptions(condition)
        return await this.procedureRepository.find({ where })
    }

    async findOne(condition: ProcedureCondition): Promise<Procedure> {
        const where = this.getWhereOptions(condition)
        return await this.procedureRepository.findOne({ where })
    }

    async insertOne<T extends Partial<Procedure>>(dto: NoExtraProperties<Partial<Procedure>, T>): Promise<Procedure> {
        const customer = this.procedureRepository.create(dto)
        return this.procedureRepository.save(customer)
    }

    async update(condition: ProcedureCondition, dto: Partial<Omit<Procedure, 'id' | 'oid'>>): Promise<UpdateResult> {
        const where = this.getWhereOptions(condition)
        return await this.procedureRepository.update(where, dto)
    }
}
