import { HttpStatus, Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { ProcedureRepository } from '../../../../_libs/database/repositories/procedure.repository'
import { TicketProcedureRepository } from '../../../../_libs/database/repositories/ticket-procedure.repository'
import {
  ProcedureCreateBody,
  ProcedureGetManyQuery,
  ProcedureGetOneQuery,
  ProcedurePaginationQuery,
  ProcedureUpdateBody,
} from './request'

@Injectable()
export class ApiProcedureService {
  constructor(
    private readonly procedureRepository: ProcedureRepository,
    private readonly ticketProcedureRepository: TicketProcedureRepository
  ) { }

  async pagination(oid: number, query: ProcedurePaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, relation, sort } = query
    const { data, total } = await this.procedureRepository.pagination({
      relation,
      page,
      limit,
      condition: {
        oid,
        name: filter?.searchText ? { LIKE: filter.searchText } : undefined,
        procedureGroupId: filter?.procedureGroupId,
        isActive: filter?.isActive,
        updatedAt: filter?.updatedAt,
      },
      sort,
    })
    return {
      data,
      meta: { page, limit, total },
    }
  }

  async getMany(oid: number, query: ProcedureGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation } = query
    const data = await this.procedureRepository.findMany({
      relation,
      condition: {
        oid,
        name: filter?.searchText ? { LIKE: filter.searchText } : undefined,
        procedureGroupId: filter?.procedureGroupId,
        isActive: filter?.isActive,
        updatedAt: filter?.updatedAt,
      },
      sort: { id: 'ASC' },
      limit,
    })
    return { data }
  }

  async getOne(oid: number, id: number, query: ProcedureGetOneQuery): Promise<BaseResponse> {
    const procedure = await this.procedureRepository.findOne({
      relation: { procedureGroup: query?.relation?.procedureGroup },
      condition: { oid, id },
    })
    if (!procedure) throw new BusinessException('error.Database.NotFound')
    return { data: { procedure } }
  }

  async createOne(oid: number, body: ProcedureCreateBody): Promise<BaseResponse> {
    const procedure = await this.procedureRepository.insertOneFullFieldAndReturnEntity({
      oid,
      ...body,
    })
    return { data: { procedure } }
  }

  async updateOne(oid: number, id: number, body: ProcedureUpdateBody): Promise<BaseResponse> {
    const [procedure] = await this.procedureRepository.updateAndReturnEntity({ oid, id }, body)
    if (!procedure) throw new BusinessException('error.Database.UpdateFailed')

    return { data: { procedure } }
  }

  async destroyOne(oid: number, id: number): Promise<BaseResponse> {
    const ticketProcedureList = await this.ticketProcedureRepository.findMany({
      condition: { oid, procedureId: id },
      limit: 10,
    })
    if (ticketProcedureList.length > 0) {
      return {
        data: { ticketProcedureList },
        success: false,
      }
    }

    const affected = await this.procedureRepository.delete({ oid, id })
    if (affected === 0) throw new BusinessException('error.Database.DeleteFailed')

    return { data: { ticketProcedureList: [], procedureId: id } }
  }
}
