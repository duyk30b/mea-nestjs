import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, In, Like, MoreThan, Not, Repository, UpdateResult } from 'typeorm'
import { convertViToEn } from '../../../common/helpers/string.helper'
import { NoExtraProperties } from '../../../common/helpers/typescript.helper'
import { escapeSearch } from '../../common/base.dto'
import { Customer } from '../../entities'
import { CustomerCondition, CustomerOrder } from './customer.dto'

@Injectable()
export class CustomerRepository {
    constructor(@InjectRepository(Customer) private customerRepository: Repository<Customer>) {}

    getWhereOptions(condition: CustomerCondition) {
        const where: FindOptionsWhere<Customer> = {}

        if (condition.oid != null) where.oid = condition.oid
        if (condition.id != null) where.id = condition.id
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

        if (Array.isArray(condition.debt)) {
            if (condition.debt[0] === '>') {
                where.debt = MoreThan(condition.debt[1])
            }
            if (condition.debt[0] === '!=') {
                where.debt = Not(condition.debt[1])
            }
        }

        return where
    }

    async pagination(options: { page: number; limit: number; condition?: CustomerCondition; order?: CustomerOrder }) {
        const { limit, page, condition, order } = options
        const where = this.getWhereOptions(condition)

        const [data, total] = await this.customerRepository.findAndCount({
            where,
            order,
            take: limit,
            skip: (page - 1) * limit,
        })

        return { total, page, limit, data }
    }

    async find(options: { limit?: number; condition?: CustomerCondition; order?: CustomerOrder }): Promise<Customer[]> {
        const { limit, condition, order } = options
        const where = this.getWhereOptions(condition)

        return await this.customerRepository.find({
            where,
            order,
            take: limit,
        })
    }

    async findMany(condition: CustomerCondition): Promise<Customer[]> {
        const where = this.getWhereOptions(condition)
        return await this.customerRepository.find({ where })
    }

    async findOne(condition: CustomerCondition, order?: CustomerOrder): Promise<Customer> {
        const where = this.getWhereOptions(condition)
        return await this.customerRepository.findOne({
            where,
            order,
        })
    }

    async insertOne<T extends Partial<Customer>>(dto: NoExtraProperties<Partial<Customer>, T>): Promise<Customer> {
        const customer = this.customerRepository.create(dto)
        return this.customerRepository.save(customer)
    }

    async update(condition: CustomerCondition, dto: Partial<Omit<Customer, 'id' | 'oid'>>): Promise<UpdateResult> {
        const where = this.getWhereOptions(condition)
        return await this.customerRepository.update(where, dto)
    }
}
