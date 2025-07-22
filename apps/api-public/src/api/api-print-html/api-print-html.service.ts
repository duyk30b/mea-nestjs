import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import {
  PrintHtmlManager,
  PrintHtmlRepository,
} from '../../../../_libs/database/repositories/print-html.repository'
import {
  PrintHtmlCreateBody,
  PrintHtmlGetManyQuery,
  PrintHtmlGetOneQuery,
  PrintHtmlPaginationQuery,
  PrintHtmlSetDefaultBody,
  PrintHtmlUpdateBody,
} from './request'

@Injectable()
export class ApiPrintHtmlService {
  constructor(
    private readonly printHtmlRepository: PrintHtmlRepository,
    private readonly printHtmlManager: PrintHtmlManager
  ) { }

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
    const printHtml = await this.printHtmlRepository.insertOneFullFieldAndReturnEntity({
      oid,
      ...body,
    })
    if (!printHtml) throw new BusinessException('error.Database.InsertFailed')
    return { printHtml }
  }

  async updateOne(oid: number, id: number, body: PrintHtmlUpdateBody) {
    if (body.isDefault) {
      await this.printHtmlRepository.update(
        { oid, printHtmlType: body.printHtmlType },
        { isDefault: 0 }
      )
    }
    const printHtml = await this.printHtmlRepository.updateOneAndReturnEntity({ id, oid }, body)
    if (!printHtml) throw new BusinessException('error.Database.UpdateFailed')
    return { printHtml }
  }

  async destroyOne(oid: number, id: number) {
    const affected = await this.printHtmlRepository.delete({ oid, id })
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

  async saveListDefault(oid: number, body: PrintHtmlSetDefaultBody) {
    await this.printHtmlRepository.update({ oid }, { isDefault: 0 })

    const tempList = body.listDefault
      .filter((i) => !!i.printHtmlId)
      .map((i) => {
        return { id: i.printHtmlId, printHtmlType: i.printHtmlType, isDefault: 1 }
      })

    await this.printHtmlManager.bulkUpdate({
      manager: this.printHtmlRepository.getManager(),
      condition: { oid },
      compare: ['id'],
      update: ['isDefault', 'printHtmlType'],
      tempList,
      options: { requireEqualLength: true },
    })

    return true
  }
}
