import { Injectable } from '@nestjs/common'
import { escapeSearch } from 'apps/_libs/database/common/base.dto'
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
        const { page, limit, filter, sort } = query

        return await this.distributorRepository.pagination({
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

    async getMany(oid: number, query: DistributorGetManyQuery) {
        const { limit, filter } = query

        return await this.distributorRepository.findMany({
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

    async getOne(oid: number, id: number) {
        const distributor = await this.distributorRepository.findOneBy({ oid, id })
        if (!distributor) throw new BusinessException('common.Distributor.NotExist')
        return distributor
    }

    async createOne(oid: number, body: DistributorCreateBody) {
        return await this.distributorRepository.insertOne({ oid, ...body })
    }

    async updateOne(oid: number, id: number, body: DistributorUpdateBody) {
        const affected = await this.distributorRepository.update({ id, oid }, body)
        return await this.distributorRepository.findOneBy({ oid, id })
    }

    async deleteOne(oid: number, id: number) {
        await this.distributorRepository.delete(oid, id)
        return { success: true }
    }
}
