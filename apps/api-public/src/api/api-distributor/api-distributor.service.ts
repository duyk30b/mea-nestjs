import { Injectable } from '@nestjs/common'
import { escapeSearch } from '../../../../_libs/common/dto'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { DistributorRepository } from '../../../../_libs/database/repository'
import {
    DistributorCreateBody,
    DistributorGetManyQuery,
    DistributorPaginationQuery,
    DistributorUpdateBody,
} from './request'

@Injectable()
export class ApiDistributorService {
    constructor(private readonly distributorRepository: DistributorRepository) {}

    async pagination(oid: number, query: DistributorPaginationQuery) {
        const { page, limit, filter, sort, relation } = query

        return await this.distributorRepository.pagination({
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

    async getMany(oid: number, query: DistributorGetManyQuery) {
        const { limit, filter, relation } = query

        return await this.distributorRepository.findMany({
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
            limit,
        })
    }

    async getOne(oid: number, id: number) {
        const data = await this.distributorRepository.findOneBy({ oid, id })
        if (!data) throw new BusinessException('common.Distributor.NotExist')
        return data
    }

    async createOne(oid: number, body: DistributorCreateBody) {
        const id = await this.distributorRepository.insertOne({ oid, ...body })
        const data = await this.distributorRepository.findOneById(id)
        return data
    }

    async updateOne(oid: number, id: number, body: DistributorUpdateBody) {
        const affected = await this.distributorRepository.update({ id, oid }, body)
        const data = await this.distributorRepository.findOneBy({ oid, id })
        return data
    }

    async deleteOne(oid: number, id: number) {
        const affected = await this.distributorRepository.update({ oid, id }, { deletedAt: Date.now() })
        if (affected === 0) {
            throw new Error('Không thể xóa bản ghi')
        }
        const data = await this.distributorRepository.findOneById(id)
        return data
    }
}
