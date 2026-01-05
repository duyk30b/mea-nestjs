import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { PrintHtmlRepository } from '../../../../_libs/database/repositories/print-html.repository'
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

  async pagination(oid: number, query: PrintHtmlPaginationQuery) {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.printHtmlRepository.pagination({
      page,
      limit,
      relation,
      condition: {
        oid: { IN: [1, oid] },
        updatedAt: filter?.updatedAt,
      },
      sort: sort || { priority: 'ASC' },
    })
    return { printHtmlList: data, total, page, limit }
  }

  async getList(oid: number, query: PrintHtmlGetManyQuery) {
    const { limit, filter, relation, sort } = query

    const printHtmlList = await this.printHtmlRepository.findMany({
      relation,
      condition: {
        oid: { IN: [1, oid] },
        updatedAt: filter?.updatedAt,
      },
      limit,
      sort: sort || { priority: 'ASC' },
    })
    return { printHtmlList }
  }

  async getOne(oid: number, query: PrintHtmlGetOneQuery) {
    const { filter, relation } = query
    const printHtml = await this.printHtmlRepository.findOne({
      relation,
      condition: {
        oid: { IN: [1, oid] },
        updatedAt: filter?.updatedAt,
      },
    })
    return { printHtml }
  }

  async detail(oid: number, id: number, query: PrintHtmlGetOneQuery) {
    const printHtml = await this.printHtmlRepository.findOne({
      condition: {
        oid: { IN: [1, oid] },
        id,
      },
      relation: query.relation,
    })
    if (!printHtml) throw new BusinessException('error.Database.NotFound')
    return { printHtml }
  }

  async createOne(oid: number, body: PrintHtmlCreateBody) {
    const printHtml = await this.printHtmlRepository.insertOne({
      oid,
      ...body,
    })
    if (!printHtml) throw new BusinessException('error.Database.InsertFailed')
    return { printHtml }
  }

  async updateOne(oid: number, id: number, body: PrintHtmlUpdateBody) {
    const printHtml = await this.printHtmlRepository.updateOne({ id, oid }, body)
    if (!printHtml) throw new BusinessException('error.Database.UpdateFailed')
    return { printHtml }
  }

  async destroyOne(oid: number, id: number) {
    const affected = await this.printHtmlRepository.deleteBasic({ oid, id })
    if (affected === 0) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    return { printHtmlId: id }
  }

  async systemList() {
    const printHtmlSystem = await this.printHtmlRepository.findMany({
      condition: { oid: 1 },
      sort: { id: 'ASC' },
    })
    return { printHtmlSystem }
  }
}
