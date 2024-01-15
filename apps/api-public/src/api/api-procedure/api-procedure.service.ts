import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ProcedureRepository } from '../../../../_libs/database/repository'
import { ProcedureCreateBody, ProcedureGetManyQuery, ProcedurePaginationQuery, ProcedureUpdateBody } from './request'

@Injectable()
export class ApiProcedureService {
    constructor(private readonly procedureService: ProcedureRepository) {}

    async pagination(oid: number, query: ProcedurePaginationQuery) {
        const { page, limit, filter, relation, sort } = query
        return this.procedureService.pagination({
            relation,
            page,
            limit,
            condition: {
                oid,
                name: filter?.searchText ? { LIKE: filter.searchText } : undefined,
                group: filter?.group,
                isActive: filter?.isActive,
                updatedAt: filter?.updatedAt,
            },
            sort: sort || { id: 'DESC' },
        })
    }

    async getMany(oid: number, query: ProcedureGetManyQuery) {
        const { limit, filter, relation } = query
        return await this.procedureService.findMany({
            relation,
            condition: {
                oid,
                name: filter?.searchText ? { LIKE: filter.searchText } : undefined,
                group: filter?.group,
                isActive: filter?.isActive,
                updatedAt: filter?.updatedAt,
            },
            sort: { id: 'ASC' },
            limit,
        })
    }

    async getOne(oid: number, id: number) {
        const data = await this.procedureService.findOneBy({ oid, id })
        if (!data) throw new BusinessException('common.Procedure.NotExist')
        return data
    }

    async createOne(oid: number, body: ProcedureCreateBody) {
        const id = await this.procedureService.insertOne({ oid, ...body })
        const data = await this.procedureService.findOneById(id)
        return data
    }

    async updateOne(oid: number, id: number, body: ProcedureUpdateBody) {
        const affected = await this.procedureService.update({ oid, id }, body)
        const data = await this.procedureService.findOneById(id)
        return data
    }

    async deleteOne(oid: number, id: number) {
        const affected = await this.procedureService.update({ oid, id }, { deletedAt: Date.now() })
        if (affected === 0) {
            throw new Error('Không thể xóa bản ghi')
        }
        const data = await this.procedureService.findOneById(id)
        return data
    }
}
