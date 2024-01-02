import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { escapeSearch } from '../../../../_libs/database/common/base.dto'
import { CustomerRepository } from '../../../../_libs/database/repository'
import {
    CustomerCreateBody,
    CustomerGetManyQuery,
    CustomerGetOneQuery,
    CustomerPaginationQuery,
    CustomerUpdateBody,
} from './request'

@Injectable()
export class ApiCustomerService {
    constructor(private readonly customerRepository: CustomerRepository) {}

    async pagination(oid: number, query: CustomerPaginationQuery) {
        const { page, limit, filter, sort } = query

        return await this.customerRepository.pagination({
            page,
            limit,
            condition: {
                oid,
                isActive: filter?.isActive,
                fullName: filter?.fullName ? { LIKE: `%${escapeSearch(filter.fullName)}%` } : undefined,
                phone: filter?.phone ? { LIKE: `%${escapeSearch(filter.phone)}%` } : undefined,
                debt: filter?.debt,
                updatedAt: filter?.updatedAt,
            },
            sort: sort || { id: 'DESC' },
        })
    }

    async getMany(oid: number, query: CustomerGetManyQuery) {
        const { limit, filter } = query

        return await this.customerRepository.findMany({
            condition: {
                oid,
                isActive: filter?.isActive,
                fullName: filter?.fullName ? { LIKE: `%${escapeSearch(filter.fullName)}%` } : undefined,
                phone: filter?.phone ? { LIKE: `%${escapeSearch(filter.phone)}%` } : undefined,
                updatedAt: filter?.updatedAt,
            },
            limit,
        })
    }

    async getOne(oid: number, id: number, query?: CustomerGetOneQuery) {
        const customer = await this.customerRepository.findOneBy({ oid, id })
        if (!customer) throw new BusinessException('common.Customer.NotExist')
        return customer
    }

    async createOne(oid: number, body: CustomerCreateBody) {
        const id = await this.customerRepository.insertOne({ oid, ...body })
        return await this.customerRepository.findOneById(id)
    }

    async updateOne(oid: number, id: number, body: CustomerUpdateBody) {
        const affected = await this.customerRepository.update({ oid, id }, body)
        return await this.customerRepository.findOneBy({ oid, id })
    }

    async deleteOne(oid: number, id: number) {
        await this.customerRepository.delete(oid, id)
        return { success: true }
    }
}
