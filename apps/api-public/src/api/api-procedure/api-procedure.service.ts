import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { ProcedureRepository } from '../../../../_libs/database/repository/procedure/procedure.repository'
import {
  ProcedureCreateBody,
  ProcedureGetManyQuery,
  ProcedurePaginationQuery,
  ProcedureUpdateBody,
} from './request'

@Injectable()
export class ApiProcedureService {
  constructor(private readonly procedureService: ProcedureRepository) {}

  async pagination(oid: number, query: ProcedurePaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, relation, sort } = query
    const { data, total } = await this.procedureService.pagination({
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
    return {
      data,
      meta: { page, limit, total },
    }
  }

  async getMany(oid: number, query: ProcedureGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation } = query
    const data = await this.procedureService.findMany({
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
    return { data }
  }

  async getOne(oid: number, id: number): Promise<BaseResponse> {
    const data = await this.procedureService.findOneBy({ oid, id })
    if (!data) throw new BusinessException('error.Procedure.NotExist')
    return { data }
  }

  async createOne(oid: number, body: ProcedureCreateBody): Promise<BaseResponse> {
    const id = await this.procedureService.insertOne({ oid, ...body })
    const data = await this.procedureService.findOneById(id)
    return { data }
  }

  async updateOne(oid: number, id: number, body: ProcedureUpdateBody): Promise<BaseResponse> {
    const affected = await this.procedureService.update({ oid, id }, body)
    const data = await this.procedureService.findOneById(id)
    return { data }
  }

  async deleteOne(oid: number, id: number): Promise<BaseResponse> {
    const affected = await this.procedureService.update({ oid, id }, { deletedAt: Date.now() })
    if (affected === 0) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    const data = await this.procedureService.findOneById(id)
    return { data }
  }
}
