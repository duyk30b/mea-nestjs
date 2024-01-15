import { Injectable } from '@nestjs/common'
import { escapeSearch } from '../../../../_libs/common/dto'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
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
        const { page, limit, filter, sort, relation } = query

        return await this.customerRepository.pagination({
            page,
            limit,
            relation,
            condition: {
                oid,
                isActive: filter?.isActive,
                $OR: filter.searchText
                    ? [{ fullName: { LIKE: filter.searchText } }, { phone: { LIKE: filter.searchText } }]
                    : undefined,
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
                $OR: filter.searchText
                    ? [{ fullName: { LIKE: filter.searchText } }, { phone: { LIKE: filter.searchText } }]
                    : undefined,
                updatedAt: filter?.updatedAt,
            },
            limit,
        })
    }

    async getOne(oid: number, id: number, query?: CustomerGetOneQuery) {
        const data = await this.customerRepository.findOneBy({ oid, id })
        if (!data) throw new BusinessException('common.Customer.NotExist')
        return data
    }

    async createOne(oid: number, body: CustomerCreateBody) {
        const id = await this.customerRepository.insertOne({ oid, ...body })
        const data = await this.customerRepository.findOneById(id)
        return data
    }

    async updateOne(oid: number, id: number, body: CustomerUpdateBody) {
        const affected = await this.customerRepository.update({ oid, id }, body)
        const data = await this.customerRepository.findOneBy({ oid, id })
        return data
    }

    async deleteOne(oid: number, id: number) {
        const affected = await this.customerRepository.update({ oid, id, debt: 0 }, { deletedAt: Date.now() })
        if (affected === 0) {
            throw new Error('Không thể xóa bản ghi')
        }
        const data = await this.customerRepository.findOneById(id)
        return data
    }
}
