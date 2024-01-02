import { Injectable } from '@nestjs/common'
import { ProcedureRepository } from '../../../../_libs/database/repository'
import { ProcedureCreateBody, ProcedureGetManyQuery, ProcedurePaginationQuery, ProcedureUpdateBody } from './request'

@Injectable()
export class ApiProcedureService {
    constructor(private readonly procedureService: ProcedureRepository) {}

    async pagination(oid: number, query: ProcedurePaginationQuery) {
        return this.procedureService.pagination({
            page: query.page,
            limit: query.limit,
            condition: {
                oid,
                group: query.filter?.group,
                isActive: query.filter?.isActive,
                name: query.filter?.name,
                deletedAt: { IS_NULL: true },
            },
            sort: query.sort || { id: 'DESC' },
        })
    }

    async getMany(oid: number, query: ProcedureGetManyQuery) {
        return await this.procedureService.findMany({
            condition: {
                oid,
                name: query.filter?.name,
                group: query.filter?.group,
                isActive: query.filter?.isActive,
                deletedAt: { IS_NULL: true },
            },
            sort: { id: 'ASC' },
            limit: query.limit,
        })
    }

    async getOne(oid: number, id: number) {
        return await this.procedureService.findOneBy({ oid, id })
    }

    async createOne(oid: number, body: ProcedureCreateBody) {
        return await this.procedureService.insertOne({ oid, ...body })
    }

    async updateOne(oid: number, id: number, body: ProcedureUpdateBody) {
        const affected = await this.procedureService.update({ id, oid }, body)
        return await this.procedureService.findOneBy({ id })
    }

    async deleteOne(oid: number, id: number) {
        await this.procedureService.delete(oid, id)
        return { success: true }
    }
}
