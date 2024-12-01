import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { PrintHtmlRepository } from '../../../../_libs/database/repository/print-html/print-html.repository'
import {
  PrintHtmlCreateBody,
  PrintHtmlGetManyQuery,
  PrintHtmlGetOneQuery,
  PrintHtmlPaginationQuery,
  PrintHtmlUpdateBody,
} from './request'

@Injectable()
export class ApiPrintHtmlService {
  constructor(private readonly printHtmlRepository: PrintHtmlRepository) { }

  async pagination(oid: number, query: PrintHtmlPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.printHtmlRepository.pagination({
      page,
      limit,
      relation,
      condition: {
        oid,
        updatedAt: filter?.updatedAt,
      },
      sort,
    })
    return {
      data,
      meta: { total, page, limit },
    }
  }

  async getList(oid: number, query: PrintHtmlGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation } = query

    const data = await this.printHtmlRepository.findMany({
      relation,
      condition: {
        oid,
        updatedAt: filter?.updatedAt,
      },
      limit,
    })
    return { data }
  }

  async getOne(oid: number, query: PrintHtmlGetOneQuery): Promise<BaseResponse> {
    const { filter, relation } = query
    const printHtml = await this.printHtmlRepository.findOne({
      relation,
      condition: {
        oid,
        updatedAt: filter?.updatedAt,
      },
    })
    return { data: { printHtml } }
  }

  async detail(oid: number, id: number, query: PrintHtmlGetOneQuery): Promise<BaseResponse> {
    const printHtml = await this.printHtmlRepository.findOne({
      condition: {
        oid,
        id,
      },
      relation: query.relation,
    })
    if (!printHtml) throw new BusinessException('error.Database.NotFound')
    return { data: { printHtml } }
  }

  async createOne(oid: number, body: PrintHtmlCreateBody): Promise<BaseResponse> {
    const printHtml = await this.printHtmlRepository.insertOneFullFieldAndReturnEntity({
      oid,
      ...body,
    })
    if (!printHtml) throw new BusinessException('error.Database.InsertFailed')
    return { data: { printHtml } }
  }

  async updateOne(oid: number, id: number, body: PrintHtmlUpdateBody): Promise<BaseResponse> {
    const [printHtml] = await this.printHtmlRepository.updateAndReturnEntity({ id, oid }, body)
    if (!printHtml) throw new BusinessException('error.Database.UpdateFailed')
    return { data: { printHtml } }
  }

  async destroyOne(oid: number, id: number): Promise<BaseResponse> {
    const affected = await this.printHtmlRepository.delete({ oid, id })
    if (affected === 0) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    return { data: true }
  }

  async systemList(): Promise<BaseResponse> {
    const data = await this.printHtmlRepository.findMany({
      condition: { oid: 1 },
      sort: { id: 'ASC' },
    })
    return { data }
  }
}
