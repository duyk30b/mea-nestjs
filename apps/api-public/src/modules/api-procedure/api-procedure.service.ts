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
                searchText: query.filter?.searchText,
            },
            order: query.sort || { id: 'DESC' },
        })
    }

    async getMany(oid: number, query: ProcedureGetManyQuery) {
        return await this.procedureService.find({
            condition: {
                oid,
                searchText: query.filter?.searchText,
                group: query.filter?.group,
                isActive: query.filter?.isActive,
            },
            limit: query.limit,
        })
    }

    async getOne(oid: number, id: number) {
        return await this.procedureService.findOne({ oid, id })
    }

    async createOne(oid: number, body: ProcedureCreateBody) {
        return await this.procedureService.insertOne({ oid, ...body })
    }

    async updateOne(oid: number, id: number, body: ProcedureUpdateBody) {
        const { affected } = await this.procedureService.update({ id, oid }, body)
        if (affected !== 1) throw new Error('Database.UpdateFailed')
        return await this.procedureService.findOne({ id })
    }
}
