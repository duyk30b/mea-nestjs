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
        key: filter?.key,
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
        key: filter?.key,
        updatedAt: filter?.updatedAt,
      },
      limit,
    })
    return { data }
  }

  async getOne(oid: number, query: PrintHtmlGetOneQuery): Promise<BaseResponse> {
    const { filter, relation } = query
    const print = await this.printHtmlRepository.findOne({
      relation,
      condition: {
        oid,
        key: filter?.key,
        updatedAt: filter?.updatedAt,
      },
    })
    if (!print) throw new BusinessException('error.Database.NotFound')
    return { data: { print } }
  }

  async detail(oid: number, id: number): Promise<BaseResponse> {
    const print = await this.printHtmlRepository.findOneBy({ oid, id })
    if (!print) throw new BusinessException('error.Database.NotFound')
    return { data: { print } }
  }

  async createOne(oid: number, body: PrintHtmlCreateBody): Promise<BaseResponse> {
    const print = await this.printHtmlRepository.insertOneFullFieldAndReturnEntity({ oid, ...body })
    if (!print) throw new BusinessException('error.Database.InsertFailed')
    return { data: { print } }
  }

  async updateOne(oid: number, id: number, body: PrintHtmlUpdateBody): Promise<BaseResponse> {
    const [print] = await this.printHtmlRepository.updateAndReturnEntity({ id, oid }, body)
    if (!print) throw new BusinessException('error.Database.UpdateFailed')
    return { data: { print } }
  }

  async destroyOne(oid: number, id: number): Promise<BaseResponse> {
    const affected = await this.printHtmlRepository.delete({ oid, id })
    if (affected === 0) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    return { data: true }
  }
}
